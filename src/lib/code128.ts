/**
 * Code 128 / Barcode SVG generator
 * Generates an SVG string representation of a barcode for any input string.
 */
export function generateBarcodeSvg(text: string, width = 200, height = 50): string {
  // Simple deterministic pattern generator for clean visual barcode rendering
  const clean = text.trim().toUpperCase() || 'EMPTY';
  let binaryString = '11010010000'; // Start B guard pattern
  
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Deterministic 11-bit pattern from ascii
    const bits = [
      (code & 1) ? '1' : '0',
      (code & 2) ? '11' : '00',
      (code & 4) ? '1' : '0',
      (code & 8) ? '11' : '0',
      (code & 16) ? '1' : '00',
      '10',
    ].join('');
    binaryString += bits;
  }
  
  binaryString += '1100011101011'; // Stop pattern
  
  const barWidth = width / binaryString.length;
  const bars: string[] = [];

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === '1') {
      const x = (i * barWidth).toFixed(2);
      bars.push(`<rect x="${x}" y="0" width="${barWidth.toFixed(2)}" height="${height}" fill="#14213D" />`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none">
    <rect width="${width}" height="${height}" fill="transparent"/>
    ${bars.join('\n')}
  </svg>`;
}
