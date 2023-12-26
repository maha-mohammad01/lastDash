// DeleteConfirmationModal.js

import React from 'react';

function DeleteConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-slate-300/20 backdrop-blur-sm">
      <div className="flex max-h-[90vh] max-w-xs flex-col gap-6 overflow-hidden rounded bg-white p-6 text-slate-500 shadow-xl shadow-slate-700/10 text-center">
        <header className="flex flex-col items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 stroke-pink-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            role="graphics-symbol"
            aria-labelledby="title-21 desc-21"
          >
            {/* SVG Path */}
          </svg>
          <h3 className="flex-1 text-xl font-medium text-slate-700">Delete User?</h3>
        </header>
        <div className="flex-1 overflow-auto">
          <p>After deleting the User, recovery will not be possible</p>
        </div>
        <div className="flex justify-start gap-2">
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center flex-1 h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded whitespace-nowrap bg-emerald-500 hover:bg-gradient-to-r from-emerald-700 to-emerald-400 focus:bg-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
          >
            <span>Yes, I'm sure</span>
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center flex-1 h-10 gap-2 px-5 text-sm font-medium tracking-wide transition duration-300 rounded justify-self-center whitespace-nowrap text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 focus:bg-emerald-200 focus:text-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-emerald-300 disabled:shadow-none disabled:hover:bg-transparent"
          >
            <span>Maybe not</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
