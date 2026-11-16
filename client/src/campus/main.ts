// Entry point for the 3D campus page (campus.html).
import '../styles/campus.css';
import { readCampusOptions } from '../shared/routes';
import { CampusApp } from './CampusApp';

new CampusApp(readCampusOptions()).start();
