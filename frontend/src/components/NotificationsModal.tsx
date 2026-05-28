import React from "react";
import { X, CheckCircle2, AlertTriangle, Info, BellOff } from "lucide-react";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "success" | "warning";
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllRead,
  onClearAll,
}: NotificationsModalProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">System Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-100/50 border-b border-slate-100 flex justify-between text-xs font-semibold text-blue-600">
            <button 
              onClick={onMarkAllRead} 
              className="hover:text-blue-800 cursor-pointer focus:outline-none"
            >
              Mark all as read
            </button>
            <button 
              onClick={onClearAll} 
              className="hover:text-amber-700 cursor-pointer focus:outline-none"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Log list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {notifications.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <BellOff size={20} />
              </div>
              <p className="text-slate-500 text-xs font-medium">All caught up!</p>
              <p className="text-[11px] text-slate-400">No new system alerts or logs at this time.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              let Icon = Info;
              let iconColor = "text-blue-500 bg-blue-50";
              if (notif.type === "success") {
                Icon = CheckCircle2;
                iconColor = "text-emerald-500 bg-emerald-50";
              } else if (notif.type === "warning") {
                Icon = AlertTriangle;
                iconColor = "text-amber-500 bg-amber-50";
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`p-3.5 rounded-lg border flex gap-3 transition-all cursor-pointer select-none group text-left ${
                    notif.read
                      ? "bg-white border-slate-100 hover:bg-slate-50/55"
                      : "bg-slate-50/70 border-slate-200 hover:bg-blue-50/20 shadow-xs"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${iconColor}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[12.5px] truncate ${notif.read ? "text-slate-600" : "font-semibold text-slate-800"}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-slate-500 leading-normal mt-0.5 whitespace-pre-line">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono inline-block mt-1.5">
                      {notif.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 font-mono">
          System Core: Active Cluster v4.12.0
        </div>
      </div>
    </div>
  );
}
