import React from 'react';
import '../styles/Home.css';

function Home() {
    return (
        <div className="home-container">
            <section>
                <div>
                    <h1>Welcome to Strinder!</h1>
                    <h2 className="last">Track your workouts. Meet new friends. Stay secure.</h2>
                </div>
            </section>

            <section>
                <h2>Main Features</h2>
                <div className="feature-card">
                    <h3>GPS Workout Tracking</h3>
                    <img src="/GPS.avif" alt="GPS Tracking" />
                    <p>Track your runs, hikes, and rides in real time using your phone's GPS. Never miss a step or a turn!</p>
                </div>
                <div className="feature-card">
                    <h3>Path Tracing with OpenStreetMap</h3>
                    <img src="/map.png" alt="Path Tracing" className="map-img" />
                    <p>See your workout path traced on a beautiful map. Analyze your route and share it with friends.</p>
                </div>
                <div className="feature-card">
                    <h3>Add &amp; Message Friends</h3>
                    <img src="/friends.png" alt="Friends" />
                    <p>Connect with classmates and new friends. Send messages, share workouts, and motivate each other!</p>
                </div>
                <div className="feature-card">
                    <h3>Face 2FA Security</h3>
                    <img src="/2FA.svg" alt="Face 2FA" />
                    <p>Keep your account safe with face-based two-factor authentication. Your face is your key!</p>
                </div>
            </section>

            <section className="gallery-section">
                <h2>Get Inspired</h2>
                <div className="gallery-list">
                    <img src="/run.jpg" alt="Running" />
                    <img src="/hike.webp" alt="Hiking" />
                    <img src="/cycle.webp" alt="Cycling" />
                </div>
            </section>

            {/* Promo/Stats Section */}
            <section>
                <h2>Why Strinder?</h2>
                <ul>
                    <li>🏃 Over <b>500km</b> tracked by students this semester!</li>
                    <li>🤝 <b>100+</b> new friendships made through the app!</li>
                    <li>🔒 <b>Face 2FA</b> keeps your data secure.</li>
                    <li>🌍 Join a growing community of active students!</li>
                </ul>
            </section>

            {/* Testimonial Section */}
            <section>
                <h2>What our users say</h2>
                <blockquote>
                    "Strinder made my morning runs so much more fun! I love seeing my route on the map and chatting with friends after a workout."
                    <br />
                    <span>- Ana, student</span>
                </blockquote>
                <blockquote>
                    "The face login is super cool and makes me feel safe. Highly recommend for anyone who wants to track their progress!"
                    <br />
                    <span>- Luka, student</span>
                </blockquote>
            </section>
        </div>
    );
}

export default Home;