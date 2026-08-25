import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { History, Search, Download, ShieldCheck, UserPlus, Edit3, Trash2, FileCheck } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => 
    `${log.targetName} ${log.action} ${log.details}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'AJOUT':
        return {
          icon: <UserPlus className="h-3.5 w-3.5 text-[#5C4D3F]" />,
          bg: 'bg-[#EFE9DB] text-[#5C4D3F] border-[#D9D2C2]'
        };
      case 'MODIFICATION':
        return {
          icon: <Edit3 className="h-3.5 w-3.5 text-[#D97706]" />,
          bg: 'bg-[#EFE9DB] text-[#D97706] border-[#D9D2C2]'
        };
      case 'SUPPRESSION':
        return {
          icon: <Trash2 className="h-3.5 w-3.5 text-red-800" />,
          bg: 'bg-red-50 text-red-800 border-red-200'
        };
      default:
        return {
          icon: <FileCheck className="h-3.5 w-3.5 text-[#5C4D3F]" />,
          bg: 'bg-[#EFE9DB] text-[#5C4D3F] border-[#D9D2C2]'
        };
    }
  };

  const handleExportLog = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.action} - ${l.targetName}: ${l.details}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_audit_geneacrypt_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-[#2D2926] space-y-6 font-sans">
      
      {/* Header */}
      <div className="bg-[#EFE9DB] border border-[#D9D2C2] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-[#5C4D3F] flex items-center justify-center text-white font-bold shrink-0">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#5C4D3F]">Journal d'Historique & Audit</h2>
            <p className="text-xs text-[#8C7B6B]">Traçabilité complète des modifications et ajouts dans l'arbre ({logs.length} entrées)</p>
          </div>
        </div>

        <button
          onClick={handleExportLog}
          className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white text-xs font-bold px-4 py-2 transition flex items-center gap-1.5 shrink-0 uppercase tracking-wider cursor-pointer"
        >
          <Download className="h-4 w-4 text-[#D97706]" />
          <span>Exporter le Journal (.txt)</span>
        </button>
      </div>

      {/* Logs Table List */}
      <div className="bg-white border border-[#D9D2C2] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#D9D2C2]">
          <input
            type="text"
            placeholder="Filtrer l'historique par nom ou action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 focus:outline-hidden focus:border-[#5C4D3F]"
          />
        </div>

        <div className="divide-y divide-[#D9D2C2] text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#8C7B6B] font-serif italic">
              Aucune entrée dans le journal d'historique.
            </div>
          ) : (
            filteredLogs.map(log => {
              const badge = getActionBadge(log.action);
              return (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F9F6F0] transition">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold border flex items-center gap-1 shrink-0 uppercase tracking-wider ${badge.bg}`}>
                      {badge.icon}
                      <span>{log.action}</span>
                    </span>

                    <div>
                      <p className="font-bold font-serif text-[#5C4D3F] text-sm">{log.targetName}</p>
                      <p className="text-[#8C7B6B] text-[11px]">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-[#8C7B6B] shrink-0">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
