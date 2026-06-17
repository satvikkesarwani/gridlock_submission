import BottomNav from "./BottomNav.jsx";

export default function PhoneFrame({ activeNav, children }) {
  return (
    <main className="desktop-stage">
      <section className="phone-shell" aria-label="EventFlow AI mobile prototype">
        <div className="phone-speaker" />
        <div className="side-button left top" />
        <div className="side-button left middle" />
        <div className="side-button right" />
        <div className="phone-screen">
          <div className="scroll-area">{children}</div>
          <BottomNav active={activeNav} />
        </div>
      </section>
    </main>
  );
}
