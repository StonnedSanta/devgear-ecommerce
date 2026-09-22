export default function PrivacyPolicy() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-extrabold">
                Privacy Policy
            </h1>

            <p className="text-sm text-muted-foreground">
                Last updated: September 2026
            </p>

            <section className="space-y-2">
                <h2 className="text-xl font-bold">
                    Information We Collect
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                    DevGear may collect information provided during checkout,
                    such as your name, email address, and shipping details,
                    to process your order.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-bold">
                    Payment Information
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                    Card payments are processed through Razorpay. DevGear
                    does not directly store your complete card details.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-bold">
                    Data Protection
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                    We take reasonable measures to protect information
                    handled by the application. This demo application
                    should not be used to process real customer data
                    without additional privacy and security measures.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-bold">
                    Contact
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                    For privacy-related questions, please contact the
                    DevGear project administrator.
                </p>
            </section>
        </div>
    );
}