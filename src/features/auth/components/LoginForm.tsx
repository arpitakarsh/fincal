import React from 'react';

export function LoginForm() {
  return (
    <form className="flex flex-col gap-4 max-w-sm mx-auto p-6 border rounded-xl shadow-sm bg-white">
      <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Email</label>
        <input type="email" placeholder="you@example.com" className="border p-2 rounded" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Password</label>
        <input type="password" placeholder="••••••••" className="border p-2 rounded" />
      </div>

      <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded mt-2 hover:bg-blue-700">
        Sign In
      </button>

      <div className="text-center text-sm text-slate-500 mt-2">
        <a href="#" className="hover:underline">Forgot your password?</a>
      </div>
    </form>
  );
}
