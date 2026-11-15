import React from 'react';
import { generateBarcodeSvg } from '../../lib/code128';

export interface BarcodeDisplayProps {
  barcode: string;
  showSvg?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  barcode,
  showSvg = true,
  width = 160,
  height = 40,
  className = '',
}) => {
  const svgMarkup = React.useMemo(() => generateBarcodeSvg(barcode, width, height), [barcode, width, height]);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {showSvg && (
        <div
          className="p-1.5 bg-white border border-grey rounded-[8px] flex items-center justify-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      )}
      <span className="code-num text-xs font-medium px-2 py-0.5 rounded-[4px] bg-grey text-navy">
        {barcode}
      </span>
    </div>
  );
};
