import os
import csv
import uuid
import pandas as pd
import pdfplumber
from app.schemas.candidate import Candidate
from app.utils.text_cleaning import clean_text
from app.utils.logger import logger

def parse_skills(skills_field) -> list[str]:
    """Helper to parse a list of skills from a CSV cell."""
    if not skills_field:
        return []
    if isinstance(skills_field, list):
        return [clean_text(str(s)) for s in skills_field if str(s).strip()]
    if isinstance(skills_field, str):
        # Handle comma or semicolon separated list
        delimiters = [',', ';']
        skills = [skills_field]
        for d in delimiters:
            new_skills = []
            for s in skills:
                new_skills.extend(s.split(d))
            skills = new_skills
        return [clean_text(s) for s in skills if s.strip()]
    return []

def parse_achievements(achievements_field) -> list[str]:
    """Helper to parse list of achievements, split by pipe (|) or newline."""
    if not achievements_field:
        return []
    if isinstance(achievements_field, list):
        return [clean_text(str(a)) for a in achievements_field if str(a).strip()]
    if isinstance(achievements_field, str):
        # Typically pipe-separated or newline-separated
        delimiters = ['|', '\n']
        achievements = [achievements_field]
        for d in delimiters:
            new_ach = []
            for a in achievements:
                new_ach.extend(a.split(d))
            achievements = new_ach
        return [clean_text(a) for a in achievements if a.strip()]
    return []

def normalize_candidate_row(row: dict, idx: int = 0) -> Candidate:
    """Normalizes a raw dictionary row from a CSV into a structured Candidate object."""
    c_id = clean_text(str(row.get("id", ""))) or f"c_{idx:03d}_{str(uuid.uuid4())[:8]}"
    name = clean_text(str(row.get("name", "Unknown Candidate")))
    current_role = clean_text(str(row.get("current_role", "")))
    
    # Parse years of experience safely
    exp_years_raw = row.get("experience_years", 0)
    try:
        experience_years = float(exp_years_raw)
    except (ValueError, TypeError):
        experience_years = 0.0
        
    skills = parse_skills(row.get("skills", ""))
    summary = clean_text(str(row.get("summary", "")))
    achievements = parse_achievements(row.get("achievements", ""))
    
    # Build a consolidated raw text representing the profile for embeddings/LLM
    achievements_str = "\n".join([f"- {a}" for a in achievements])
    raw_text = f"Name: {name}\nRole: {current_role}\nExperience: {experience_years} years\nSkills: {', '.join(skills)}\nSummary: {summary}"
    if achievements:
        raw_text += f"\nAchievements:\n{achievements_str}"
        
    return Candidate(
        id=c_id,
        name=name,
        current_role=current_role,
        experience_years=experience_years,
        skills=skills,
        summary=summary,
        achievements=achievements,
        raw_text=raw_text
    )

def load_candidates_from_csv(csv_path: str) -> list[Candidate]:
    """Loads candidates from a CSV file."""
    logger.info(f"Loading candidates from CSV file: {csv_path}")
    candidates = []
    
    if not os.path.exists(csv_path):
        logger.error(f"CSV file not found: {csv_path}")
        return []
        
    try:
        # Load using pandas for robust handling
        df = pd.read_csv(csv_path)
        # Fill NaNs with empty string
        df = df.fillna("")
        
        for idx, row in df.iterrows():
            try:
                candidate = normalize_candidate_row(row.to_dict(), idx)
                candidates.append(candidate)
            except Exception as row_error:
                logger.warning(f"Failed to normalize candidate row {idx}: {row_error}")
                
        logger.info(f"Successfully loaded {len(candidates)} candidates from CSV.")
        return candidates
    except Exception as e:
        logger.error(f"Error loading CSV file: {e}")
        return []

def load_candidates_from_pdf_folder(folder_path: str) -> list[Candidate]:
    """Loads and parses PDF resumes in a given folder (optional extension)."""
    logger.info(f"Loading candidate resumes from PDF folder: {folder_path}")
    candidates = []
    
    if not os.path.exists(folder_path):
        logger.warning(f"PDF folder not found: {folder_path}")
        return []
        
    try:
        pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith(".pdf")]
        for idx, filename in enumerate(pdf_files):
            file_path = os.path.join(folder_path, filename)
            try:
                with pdfplumber.open(file_path) as pdf:
                    text_pages = [page.extract_text() for page in pdf.pages if page.extract_text()]
                    full_text = "\n".join(text_pages)
                
                cleaned_text = clean_text(full_text)
                
                # Create a Candidate profile from the raw text
                # In V1, we'll parse basic metadata like name from filename or text
                c_id = f"pdf_{idx:03d}_{str(uuid.uuid4())[:8]}"
                name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()
                
                # Construct candidate with raw text
                # Deep extraction is handled in behavioral scorer and pairwise ranker
                candidate = Candidate(
                    id=c_id,
                    name=name,
                    current_role="Unknown",
                    experience_years=0.0,  # parsed downstream or defaulted
                    skills=[],
                    summary=cleaned_text[:300] + "...",
                    achievements=[],
                    raw_text=cleaned_text
                )
                candidates.append(candidate)
            except Exception as pdf_error:
                logger.warning(f"Failed to parse PDF resume {filename}: {pdf_error}")
                
        logger.info(f"Successfully loaded {len(candidates)} candidates from PDF resumes.")
        return candidates
    except Exception as e:
        logger.error(f"Error parsing PDF folder: {e}")
        return []
