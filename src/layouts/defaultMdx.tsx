import React from 'react';

export default function DefaultMDX({children}:Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="prose prose-sm lg:max-w-[800px] 2xl:max-w-[1280px] 2xl:prose-lg mx-auto">
      {children}
    </div>
  );
}