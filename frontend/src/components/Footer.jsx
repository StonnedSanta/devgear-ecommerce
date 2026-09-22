import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-card mt-16">
            <div className="container mx-auto px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                    {/* Copyright */}
                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                        © {currentYear} DevGear. All rights reserved.
                    </p>

                    {/* Privacy Policy */}
                    <Link
                        to="/privacy-policy"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Privacy Policy
                    </Link>

                </div>
            </div>
        </footer>
    );
}