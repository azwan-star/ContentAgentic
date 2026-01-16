import React from 'react';

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-xl font-semibold text-white">Profile Information</h2>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Display Name</label>
            <input 
              type="text" 
              defaultValue="Demo User"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
