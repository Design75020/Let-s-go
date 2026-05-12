import './App.css'

function App() {
  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <h1 className="logo">🍽️ LetsGoFood</h1>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Hot food. Delivered fast.</h2>
          <p>Your favorite meals, just a click away. Order now and enjoy premium dishes delivered to your door.</p>
          <button className="cta-button">Order Now</button>
        </div>
      </section>

      <section id="features" className="features">
        <h3>Why Choose LetsGoFood?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Lightning Fast</h4>
            <p>Get your food delivered in 30 minutes or less</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h4>Wide Selection</h4>
            <p>Choose from hundreds of restaurants and cuisines</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h4>Safe Payment</h4>
            <p>Secure and convenient payment options</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h4>Quality Assured</h4>
            <p>Rating and reviews from verified customers</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <h3>About LetsGoFood</h3>
        <p>We are revolutionizing food delivery by connecting hungry customers with the best restaurants in town. Fast, reliable, and always fresh.</p>
      </section>

      <section id="contact" className="contact">
        <h3>Get Started Today</h3>
        <p>Download our app or visit our website to start ordering</p>
        <button className="cta-button">Download App</button>
      </section>

      <section id="testimonials" className="testimonials">
        <h3>Ce que disent nos clients</h3>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "Livraison en 25 minutes chrono, repas encore chaud à l'arrivée.
              Je commande LetsGoFood tous les soirs !"
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">SC</div>
              <div>
                <strong>Sophie C.</strong>
                <span>Paris 11e</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">
              "Le choix de restaurants est incroyable. J'ai découvert des
              cuisines du monde entier sans quitter mon canapé."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">MK</div>
              <div>
                <strong>Marc K.</strong>
                <span>Lyon 2e</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★☆</div>
            <p className="testimonial-text">
              "Interface simple, paiement sécurisé, suivi en temps réel.
              Exactement ce qu'il me fallait pour mes pauses déjeuner."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">AL</div>
              <div>
                <strong>Amina L.</strong>
                <span>Bordeaux</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2026 LetsGoFood. All rights reserved.</p>
      </footer>
    </>
  )
}

export default App