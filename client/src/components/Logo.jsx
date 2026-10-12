// little dino with leaf plates on its back
function Logo() {
  return (
    <svg viewBox="0 0 200 120" width="56" height="34" aria-hidden="true">
      <path className="leaf" d="M52 56Q42 24 70 18Q78 40 52 56ZM80 48Q76 14 106 10Q112 36 80 48ZM110 48Q114 16 142 18Q142 42 110 48Z" />
      <path className="dbody" d="M40 76Q8 80 4 100Q30 96 46 90ZM40 70Q40 46 100 46Q150 46 156 66Q184 56 190 74Q190 90 164 92Q150 100 120 100L120 116H104V102H78V116H62V100Q40 96 40 70Z" />
      <circle cx="166" cy="70" r="4" fill="#222" />
      <path d="M174 82Q180 84 184 80" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default Logo;
