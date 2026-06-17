export function MapBackdrop({ children, className = "" }) {
  return (
    <div className={`mock-map ${className}`}>
      <svg className="map-grid" viewBox="0 0 620 330" preserveAspectRatio="none" aria-hidden="true">
        <rect width="620" height="330" fill="#f5f7f9" />
        <path d="M-30 55 C90 25 150 76 250 56 S448 40 656 70" stroke="#fff" strokeWidth="18" />
        <path d="M-16 190 C100 130 180 205 280 160 S470 120 640 145" stroke="#fff" strokeWidth="15" />
        <path d="M55 -20 C85 100 65 190 115 350" stroke="#fff" strokeWidth="13" />
        <path d="M250 -20 C300 80 260 210 330 355" stroke="#fff" strokeWidth="12" />
        <path d="M470 -20 C430 95 500 208 455 355" stroke="#fff" strokeWidth="14" />
        <path d="M0 285 L620 35" stroke="#e4ebf0" strokeWidth="8" />
        <path d="M5 35 L610 305" stroke="#e7eef2" strokeWidth="8" />
        <rect x="35" y="28" width="76" height="46" fill="#dceedd" opacity=".7" transform="rotate(-10 70 50)" />
        <rect x="440" y="220" width="105" height="55" fill="#dceedd" opacity=".8" transform="rotate(-10 490 250)" />
        <rect x="292" y="50" width="90" height="65" rx="30" fill="#cce8ef" opacity=".75" />
        <rect x="510" y="48" width="75" height="35" fill="#dceedd" opacity=".65" transform="rotate(18 540 68)" />
      </svg>
      {children}
    </div>
  );
}

export function StadiumIcon({ className = "" }) {
  return (
    <svg className={`stadium-icon ${className}`} viewBox="0 0 120 88" aria-hidden="true">
      <ellipse cx="60" cy="43" rx="48" ry="26" fill="#d7eaf5" stroke="#7c9db1" strokeWidth="3" />
      <ellipse cx="60" cy="39" rx="35" ry="17" fill="#f8fbff" stroke="#a9c2cf" />
      <ellipse cx="60" cy="39" rx="24" ry="10" fill="#0b9b76" />
      <path d="M20 45 L31 72 M33 51 L42 77 M48 56 L51 82 M70 56 L68 82 M87 51 L79 77 M101 45 L90 72" stroke="#6c91a6" strokeWidth="3" />
      <path d="M28 65 C48 78 73 78 94 65" fill="none" stroke="#7c9db1" strokeWidth="4" />
    </svg>
  );
}

export function CongestionMap() {
  return (
    <MapBackdrop className="congestion-map">
      <svg className="map-overlay" viewBox="0 0 620 330" preserveAspectRatio="none" aria-hidden="true">
        <path className="route red" d="M0 244 C95 218 132 178 157 126 S213 90 240 74" />
        <path className="route red light" d="M0 256 C105 229 145 184 168 134 S219 102 255 86" />
        <path className="route amber" d="M390 108 C475 103 520 110 620 120" />
        <path className="route amber light" d="M390 126 C475 122 520 130 620 140" />
        <path className="route green" d="M120 250 C230 300 330 275 380 202 C420 142 515 169 620 178" />
        <path className="route green light" d="M118 266 C230 314 348 290 397 215 C435 158 520 186 620 194" />
      </svg>
      <StadiumIcon className="stadium-center" />
      <div className="map-label red-label" style={{ left: "6%", top: "9%" }}>
        <strong>Seg_1</strong>
        <span>TTI 2.8</span>
        <small>Severe</small>
      </div>
      <div className="map-label amber-label" style={{ right: "12%", top: "7%" }}>
        <strong>Seg_2</strong>
        <span>TTI 1.4</span>
        <small>Moderate</small>
      </div>
      <div className="map-label green-label" style={{ right: "9%", bottom: "24%" }}>
        <strong>Seg_3</strong>
        <span>TTI 1.0</span>
        <small>Normal</small>
      </div>
      <div className="stadium-label">M. Chinnaswamy<br />Stadium</div>
      <div className="map-legend">
        <span><i className="dot red-dot" />Severe (TTI &gt; 2.0)</span>
        <span><i className="dot amber-dot" />Moderate (1.2 - 2.0)</span>
        <span><i className="dot green-dot" />Normal (TTI &lt; 1.2)</span>
      </div>
    </MapBackdrop>
  );
}

export function DiversionMap() {
  return (
    <MapBackdrop className="diversion-map">
      <svg className="map-overlay" viewBox="0 0 620 330" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="314" cy="170" r="118" fill="rgba(7,155,122,.09)" stroke="#11845f" strokeWidth="4" strokeDasharray="10 7" />
        <path className="route red dashed" d="M0 245 C90 220 116 172 148 130 S195 96 235 72" />
        <path className="route amber dashed" d="M495 95 C452 130 455 172 490 220" />
        <path className="route green dashed" d="M80 284 C170 280 220 256 285 245 S390 218 518 242" />
        <path className="arrow green-arrow" d="M205 278 L236 258 L211 252" />
        <path className="arrow red-arrow" d="M82 150 L102 190 L68 170" />
        <path className="arrow amber-arrow" d="M483 125 L456 101 L456 138" />
      </svg>
      <StadiumIcon className="stadium-center" />
      <div className="buffer-label">Stadium Buffer<br />500m</div>
      <div className="marker red-marker" style={{ left: "22%", top: "18%" }}>B1</div>
      <div className="marker amber-marker" style={{ right: "29%", top: "17%" }}>B2</div>
      <div className="marker blue-marker" style={{ right: "18%", bottom: "26%" }}>J12</div>
      <div className="callout red-callout" style={{ left: "2%", top: "32%" }}>Redirect<br />Inflow</div>
      <div className="callout blue-callout" style={{ right: "2%", top: "34%" }}>Signal Override<br />J12</div>
      <div className="callout green-callout" style={{ left: "16%", bottom: "8%" }}>Alternate Route</div>
    </MapBackdrop>
  );
}

export function LiveCorridorMap() {
  return (
    <MapBackdrop className="live-map">
      <svg className="map-overlay" viewBox="0 0 620 330" preserveAspectRatio="none" aria-hidden="true">
        <path className="route red" d="M0 220 C90 178 118 180 158 162 S224 118 310 124" />
        <path className="route amber" d="M310 124 C410 112 505 120 620 95" />
        <path className="route green" d="M0 292 C145 218 246 260 345 210 S489 185 620 192" />
        <path className="route green light dashed" d="M0 306 C150 232 250 274 352 224 S490 202 620 210" />
        <path d="M85 195 l25 -12 M122 167 l24 -12 M346 129 l30 -4 M520 105 l24 -6 M210 250 l30 -1" stroke="#fff" strokeWidth="5" />
      </svg>
      <div className="map-label red-label live-red">
        <strong>Segment 14</strong>
        <span>14 km/h</span>
        <small>Severe</small>
      </div>
      <div className="map-label amber-label live-amber">
        <strong>Sec Rd</strong>
        <span>28 km/h</span>
        <small>Moderate</small>
      </div>
      <div className="map-label green-label live-green">
        <strong>Alt Rd</strong>
        <span>52 km/h</span>
        <small>Clear</small>
      </div>
      <div className="incident-marker">!</div>
      <div className="cctv-marker">CAM</div>
      <div className="waterlogging-tag">Waterlogging</div>
      <div className="camera-feed">
        <header>
          <strong>Camera Feed: Segment 14</strong>
        </header>
        <div className="camera-image">
          <span className="live-badge">LIVE</span>
          <svg viewBox="0 0 240 132" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="rain" x1="0" x2="1">
                <stop offset="0" stopColor="#2b3035" />
                <stop offset="1" stopColor="#858b90" />
              </linearGradient>
            </defs>
            <rect width="240" height="132" fill="url(#rain)" />
            <path d="M80 132 L118 0 M151 132 L120 0" stroke="#cbd0d4" strokeWidth="4" opacity=".8" />
            <path d="M0 92 C62 78 150 78 240 63" stroke="#d6dadd" strokeWidth="6" opacity=".6" />
            <path d="M35 70 l25 -9 l24 11 l-4 19 l-38 2 z" fill="#dfe3e6" opacity=".95" />
            <path d="M142 62 l32 -12 l30 12 l-4 22 l-49 4 z" fill="#f2f4f5" opacity=".9" />
            <g stroke="#eef1f3" strokeWidth="2" opacity=".8">
              <path d="M28 0 L4 132" />
              <path d="M77 0 L54 132" />
              <path d="M170 0 L147 132" />
              <path d="M215 0 L195 132" />
            </g>
          </svg>
          <footer><span>Whitefield Rd / ITI Data Center</span><span>10:24:36 AM</span></footer>
        </div>
      </div>
    </MapBackdrop>
  );
}
