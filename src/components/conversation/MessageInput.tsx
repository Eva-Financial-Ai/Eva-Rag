import React, { useState, useRef, useEffect } from 'react';
import { Send } from '../../utils/mockIcons';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);
  const maxRows = 5;

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate the number of rows based on scrollHeight
      const currentRows = Math.min(
        Math.max(1, Math.floor(textareaRef.current.scrollHeight / 24)),
        maxRows
      );
      
      setRows(currentRows);
      
      // Set the height based on the number of rows
      textareaRef.current.style.height = `${currentRows * 24}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Message EVA..."
        rows={rows}
        className="w-full resize-none bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={() => !disabled && value.trim() && onSend()}
        disabled={disabled || !value.trim()}
        className={`absolute right-3 bottom-3 p-2 rounded-full ${
          disabled || !value.trim() ? 'text-gray-400 bg-gray-200' : 'text-white bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Send size={20} />
      </button>
    </div>
  );
}; 