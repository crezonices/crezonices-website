import { Link } from 'react-router-dom';
export function NotFoundPage(){return <main className="placeholder"><span className="eyebrow">404 / Not found</span><h1>This route isn’t part of Crezonices.</h1><p>Check the address or return to the homepage.</p><Link to="/" className="button">Return home</Link></main>}
