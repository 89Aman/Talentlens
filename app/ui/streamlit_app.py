import streamlit as st
import pandas as pd
import requests
import json
import os
import time
import io

# Try to import directly for in-process fallback
try:
    from app.schemas.jd import JobDescription
    from app.services.resume_parser import load_candidates_from_csv, normalize_candidate_row
    from app.services.pipeline_orchestrator import run_ranking_pipeline
    from app.services.jd_parser import parse_jd
    from app.services.rubric_generator import generate_rubric
    DIRECT_IMPORT_AVAILABLE = True
except ImportError:
    DIRECT_IMPORT_AVAILABLE = False

# API Base URL
BACKEND_URL = "http://localhost:8000"

st.set_page_config(
    page_title="TalentLens AI — Candidate Ranking System",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium styling
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
    /* Main settings */
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
        letter-spacing: -0.5px;
    }
    
    /* Header Gradient */
    .hero-container {
        background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
        border-radius: 16px;
        padding: 40px;
        margin-bottom: 30px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .hero-title {
        color: #ffffff;
        font-size: 3rem;
        margin: 0;
        font-weight: 700;
    }
    
    .hero-subtitle {
        color: #94a3b8;
        font-size: 1.2rem;
        margin-top: 10px;
        margin-bottom: 0;
    }

    /* Glassmorphic Bento Cards */
    .bento-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .bento-card-title {
        color: #6366f1;
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }
    
    /* Badge styling */
    .badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
    }
    .badge-high {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-medium {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-low {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    /* Custom Candidate Dossier Card */
    .dossier-card {
        background: linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%);
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
</style>
""", unsafe_allow_html=True)

# App header
st.markdown("""
<div class="hero-container">
    <h1 class="hero-title">🎯 TalentLens AI</h1>
    <p class="hero-subtitle">Intelligent candidate ranking and semantic evaluation system with relative Elo tournament and recruiter explainability dossiers</p>
</div>
""", unsafe_allow_html=True)

# Detect backend health
backend_online = False
try:
    health_res = requests.get(f"{BACKEND_URL}/health", timeout=2)
    if health_res.status_code == 200:
        backend_online = True
except Exception:
    pass

# Sidebar controls
st.sidebar.markdown("### ⚙️ Pipeline Configuration")

if backend_online:
    st.sidebar.success("🟢 Connected to FastAPI Backend")
else:
    if DIRECT_IMPORT_AVAILABLE:
        st.sidebar.warning("🟡 FastAPI Offline. Using Local Fallback Mode.")
    else:
        st.sidebar.error("🔴 Backend Offline & Local Fallback Unavailable.")
        st.stop()

# Mode selection
input_mode = st.sidebar.radio(
    "Data Source Selection",
    ["Use Mock Hackathon Datasets", "Upload Custom Data"]
)

top_k_shortlist = st.sidebar.slider(
    "Semantic Shortlist Size (FAISS Top-K)",
    min_value=5, max_value=100, value=30, step=5,
    help="Number of candidates loaded into intermediate behavioral scoring layer after semantic search"
)

top_k_final = st.sidebar.slider(
    "Final Rerank Count (Elo Finalists)",
    min_value=2, max_value=20, value=10, step=1,
    help="Number of candidates promoted to head-to-head pairwise tournament and brief generation"
)

st.sidebar.markdown("---")
st.sidebar.markdown("### 🔑 API Authentication")
gemini_key_input = st.sidebar.text_input("GEMINI_API_KEY", type="password", help="Leave blank if set in environment")
groq_key_input = st.sidebar.text_input("GROQ_API_KEY", type="password", help="Leave blank if set in environment")

# Handle API key injects
if gemini_key_input:
    os.environ["GEMINI_API_KEY"] = gemini_key_input
if groq_key_input:
    os.environ["GROQ_API_KEY"] = groq_key_input

# Define sample datasets paths
SAMPLE_JD_PATH = "data/sample_jd.txt"
SAMPLE_CSV_PATH = "data/candidates.csv"

# Load initial datasets
jd_content = ""
candidate_df = None

if input_mode == "Use Mock Hackathon Datasets":
    if os.path.exists(SAMPLE_JD_PATH):
        with open(SAMPLE_JD_PATH, "r", encoding="utf-8") as f:
            jd_content = f.read()
    if os.path.exists(SAMPLE_CSV_PATH):
        candidate_df = pd.read_csv(SAMPLE_CSV_PATH)
else:
    # Custom uploads
    custom_jd = st.file_uploader("Upload Job Description (.txt)", type=["txt"])
    if custom_jd:
        jd_content = custom_jd.read().decode("utf-8")
    else:
        jd_content = st.text_area("Paste Raw Job Description", height=200, placeholder="We are hiring a Senior ML Engineer...")
        
    custom_csv = st.file_uploader("Upload Candidates Dataset (.csv)", type=["csv"])
    if custom_csv:
        candidate_df = pd.read_csv(custom_csv)

# Layout: Two columns for input preview
col1, col2 = st.columns(2)

with col1:
    st.markdown("""<div class="bento-card">
        <div class="bento-card-title">📝 Job Description</div>
    </div>""", unsafe_allow_html=True)
    jd_input_text = st.text_area("Review Job Description Profile", value=jd_content, height=220)

with col2:
    st.markdown("""<div class="bento-card">
        <div class="bento-card-title">👥 Candidate Database Preview</div>
    </div>""", unsafe_allow_html=True)
    if candidate_df is not None:
        st.markdown(f"**Loaded {len(candidate_df)} candidate profiles**")
        st.dataframe(candidate_df[["name", "current_role", "experience_years", "skills"]].head(6), use_container_width=True)
    else:
        st.warning("No candidates file loaded. Upload a CSV to view candidates.")

# Trigger pipeline
if st.button("🚀 EXECUTE MULTI-STAGE RANKING PIPELINE", use_container_width=True):
    if not jd_input_text.strip():
        st.error("Please enter or upload a valid Job Description.")
    elif candidate_df is None or candidate_df.empty:
        st.error("Please load a valid candidate database.")
    else:
        # Save temp keys for direct run
        if gemini_key_input:
            from app.config import settings
            settings.gemini_api_key = gemini_key_input
        if groq_key_input:
            from app.config import settings
            settings.groq_api_key = groq_key_input
            
        # Progress spinner
        with st.spinner("Executing pipeline layers... Ingesting JD → Rubric Generation → Deterministic Filtering → FAISS Semantic Shortlist → Behavioral Scoring → Head-to-Head Pairwise Elo Tournaments → Finalizing Dossiers."):
            results = None
            
            # 1. API mode
            if backend_online:
                try:
                    # Convert candidate df back to csv bytes
                    csv_buffer = io.BytesIO()
                    candidate_df.to_csv(csv_buffer, index=False)
                    csv_buffer.seek(0)
                    
                    files = {
                        "candidates_file": ("candidates.csv", csv_buffer, "text/csv")
                    }
                    data = {
                        "jd_text": jd_input_text,
                        "top_k_shortlist": top_k_shortlist,
                        "top_k_final": top_k_final
                    }
                    
                    res = requests.post(f"{BACKEND_URL}/rank", files=files, data=data)
                    if res.status_code == 200:
                        results = res.json()
                    else:
                        st.error(f"FastAPI Backend error: {res.text}")
                except Exception as e:
                    st.warning(f"Backend API failed: {e}. Switching to direct in-process run.")
                    
            # 2. Local Direct mode fallback
            if results is None and DIRECT_IMPORT_AVAILABLE:
                try:
                    jd_obj = parse_jd(jd_input_text)
                    candidates = []
                    for idx, row in candidate_df.fillna("").iterrows():
                        cand = normalize_candidate_row(row.to_dict(), idx)
                        candidates.append(cand)
                        
                    results = run_ranking_pipeline(
                        jd=jd_obj,
                        raw_candidates=candidates,
                        top_k_shortlist=top_k_shortlist,
                        top_k_final=top_k_final
                    )
                except Exception as local_err:
                    st.error(f"Local pipeline execution failed: {local_err}")
            
            # Store results in session state
            if results:
                st.session_state["pipeline_results"] = results
                st.toast("Pipeline executed successfully!", icon="🎉")

# View Results
if "pipeline_results" in st.session_state:
    results = st.session_state["pipeline_results"]
    
    st.markdown("---")
    st.header("📊 Evaluation Pipeline Outputs")
    
    # Timing and count stats
    meta = results.get("metadata", {})
    cols = st.columns(4)
    cols[0].metric("Total Input Candidates", meta.get("total_candidates", 0))
    cols[1].metric("Filtered Out (Hard Rules)", meta.get("filtered_out", 0))
    cols[2].metric("Shortlisted Candidates", meta.get("shortlisted", 0))
    cols[3].metric("Pipeline Duration", f"{meta.get('pipeline_duration_seconds', 0.0)}s")
    
    # Rubric Bento grid
    st.subheader("📋 Dynamically Generated Evaluation Rubric")
    rubric = results.get("rubric", {})
    dimensions = rubric.get("dimensions", [])
    
    rub_cols = st.columns(len(dimensions))
    for idx, d in enumerate(dimensions):
        with rub_cols[idx]:
            st.markdown(f"""<div class="bento-card">
                <div class="bento-card-title">{d.get('name')}</div>
                <p style="font-size: 1.4rem; font-weight: 700; margin: 0; color:#3b82f6;">{int(d.get('weight', 0)*100)}% weight</p>
                <p style="font-size: 0.85rem; color:#64748b; margin-top: 5px;">{d.get('description')}</p>
            </div>""", unsafe_allow_html=True)
            
    # Shortlist & Leaderboard
    st.markdown("---")
    st.subheader("🏆 Candidate Standings Leaderboard")
    
    ranked_candidates = results.get("ranked_candidates", [])
    if ranked_candidates:
        # Convert to display DF
        leaderboard_data = []
        for rc in ranked_candidates:
            leaderboard_data.append({
                "Rank": rc.get("rank"),
                "Name": rc.get("name"),
                "Semantic Similarity": f"{rc.get('semantic_score')*100:.1f}%",
                "Behavioral Score": rc.get("behavioral_score"),
                "Final rating (Elo)": int(rc.get("elo_score")),
                "Confidence Badge": rc.get("confidence")
            })
        
        df_display = pd.DataFrame(leaderboard_data)
        st.dataframe(df_display, use_container_width=True, hide_index=True)
        
        # Candidate dossiers drawer
        st.markdown("---")
        st.subheader("🔍 Recruiter Candidate Dossiers")
        
        candidate_names = [rc.get("name") for rc in ranked_candidates]
        selected_name = st.selectbox("Select Candidate Dossier to inspect:", candidate_names)
        
        selected_cand = next((rc for rc in ranked_candidates if rc.get("name") == selected_name), None)
        
        if selected_cand:
            badge_class = "badge-high" if selected_cand.get("confidence") == "High" else "badge-medium" if selected_cand.get("confidence") == "Medium" else "badge-low"
            
            st.markdown(f"""
            <div class="dossier-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                    <h2 style="margin:0; font-size:2rem; color:#ffffff;">{selected_cand.get('name')}</h2>
                    <span class="badge {badge_class}">Confidence: {selected_cand.get('confidence')}</span>
                </div>
                <div style="display:flex; gap: 40px; margin-bottom: 20px;">
                    <div>
                        <p style="margin:0; font-size:0.85rem; color:#94a3b8;">SELECTION RANK</p>
                        <p style="margin:0; font-size:1.8rem; font-weight:700; color:#3b82f6;">#{selected_cand.get('rank')}</p>
                    </div>
                    <div>
                        <p style="margin:0; font-size:0.85rem; color:#94a3b8;">FINAL ELO RATING</p>
                        <p style="margin:0; font-size:1.8rem; font-weight:700; color:#818cf8;">{int(selected_cand.get('elo_score'))}</p>
                    </div>
                    <div>
                        <p style="margin:0; font-size:0.85rem; color:#94a3b8;">BEHAVIORAL EVIDENCE</p>
                        <p style="margin:0; font-size:1.8rem; font-weight:700; color:#10b981;">{selected_cand.get('behavioral_score')}/100</p>
                    </div>
                </div>
                
                <h4 style="color:#6366f1; margin-top:20px; margin-bottom:8px;">✅ Recruiter Fit Summary</h4>
                <p style="color:#e2e8f0; font-size:1rem; line-height:1.5; margin-bottom: 20px;">{selected_cand.get('fit_summary')}</p>
                
                <h4 style="color:#f59e0b; margin-top:20px; margin-bottom:8px;">⚠️ Technical Gaps & Risk Analysis</h4>
                <p style="color:#e2e8f0; font-size:1rem; line-height:1.5; margin-bottom: 20px;">{selected_cand.get('gap_summary')}</p>
                
                <h4 style="color:#10b981; margin-top:20px; margin-bottom:8px;">❓ Tailored Interview Question</h4>
                <p style="color:#e2e8f0; font-size:1.05rem; font-weight: 500; font-style: italic; line-height:1.5; border-left: 3px solid #10b981; padding-left: 15px; margin-bottom: 0;">
                    "{selected_cand.get('interview_question')}"
                </p>
            </div>
            """, unsafe_allow_html=True)
            
        # Export Actions
        st.markdown("---")
        st.subheader("💾 Export Deliverables")
        
        # Build CSV file
        export_df = pd.DataFrame(ranked_candidates)
        csv_data = export_df.to_csv(index=False).encode('utf-8')
        
        st.download_button(
            label="⬇️ DOWNLOAD FINAL RANKED CSV SHORTLIST",
            data=csv_data,
            file_name="talentlens_ranked_shortlist.csv",
            mime="text/csv",
            use_container_width=True
        )
        
    else:
        st.warning("No candidates ranked in the final pool.")
