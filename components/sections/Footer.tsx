export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            <h3 className="footer-brand__name">PIVON</h3>
            <p className="footer-brand__tagline">
              Lead response system setup &amp; management for real estate
              builders in Indore. Every enquiry answered, qualified, and
              routed — before the lead cools.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col__title">Quick Links</h4>
            <a href="#services" className="footer-link">Services</a>
            <a href="#how-it-works" className="footer-link">How It Works</a>
            <a href="#results" className="footer-link">Results</a>
            <a href="#pricing" className="footer-link">Pricing</a>
            <a href="#demo" className="footer-link">Live Demo</a>
            <a href="#about" className="footer-link">About</a>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 className="footer-col__title">Services</h4>
            <span className="footer-link footer-link--static">WhatsApp Auto-Response</span>
            <span className="footer-link footer-link--static">Lead Qualification</span>
            <span className="footer-link footer-link--static">CRM Integration</span>
            <span className="footer-link footer-link--static">Follow-up Automation</span>
            <span className="footer-link footer-link--static">Site Visit Booking</span>
            <span className="footer-link footer-link--static">Performance Reports</span>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col__title">Contact</h4>
            <div className="footer-contact">
              <p className="footer-contact__label">Founder</p>
              <p className="footer-contact__value">Pragya Shree</p>
            </div>
            <div className="footer-contact">
              <p className="footer-contact__label">Phone</p>
              <a href="tel:+917992484007" className="footer-contact__value footer-contact__value--link">
                +91 7992484007
              </a>
            </div>
            <div className="footer-contact">
              <p className="footer-contact__label">Email</p>
              <a href="mailto:pivon.agency@gmail.com" className="footer-contact__value footer-contact__value--link">
                pivon.agency@gmail.com
              </a>
            </div>
            <div className="footer-contact">
              <p className="footer-contact__label">Location</p>
              <p className="footer-contact__value">Indore, Madhya Pradesh, India</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-bottom__copy">
            © {currentYear} PIVON Agency. All rights reserved.
          </p>
          <p className="footer-bottom__built">
            Designed &amp; built with ♥ in Indore
          </p>
        </div>
      </div>
    </footer>
  );
}
