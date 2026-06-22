'use client';

import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export function FileUploader({
  file,
  files,
  multiple = false,
  onChange,
  onFilesChange
}: {
  file?: File | null;
  files?: File[];
  multiple?: boolean;
  onChange?: (file: File | null) => void;
  onFilesChange?: (files: File[]) => void;
}) {
  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    onDrop: (acceptedFiles) => {
      if (multiple) {
        onFilesChange?.(acceptedFiles);
      } else {
        onChange?.(acceptedFiles[0] || null);
      }
    }
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-xl border border-dashed border-blue-200 bg-white p-8 text-center hover:bg-blue-50"
      >
        <input {...getInputProps()} />

        <Upload className="mx-auto mb-3 text-blue-400" />

        <p className="font-semibold">
          파일을 드래그하거나 버튼으로 첨부하세요
        </p>

        <p className="mt-1 text-xs text-gray-500">
          PDF, PNG, JPG, JPEG, WEBP 지원
        </p>

        <button
          type="button"
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          파일 선택
        </button>
      </div>

      {!multiple && file && (
        <div className="mt-3 rounded-lg border bg-gray-50 px-3 py-2 text-sm">
          {file.name}
        </div>
      )}

      {multiple && files && files.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {files.length}개 파일 선택됨
        </div>
      )}
    </div>
  );
}