// Entry point for the landing page (index.html).
import '../styles/landing.css';
import { ContentRepository } from './ContentRepository';
import { LandingApp } from './LandingApp';

const content = new ContentRepository(`${import.meta.env.BASE_URL}content.json`);
void new LandingApp(content).start();
