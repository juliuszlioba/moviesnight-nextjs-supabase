import Header from "../header";

export default async function PrivacyPage() {
  return (
    <main>
      <Header />
      <div className="flex flex-col gap-6">
        <header className="mb-12">
          <h1 className="text-3xl font-bodl tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: March 25, 2026
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <p className="text-lg leading-relaxed text-muted-foreground">
              At <span className="font-semibold text-foreground">movies.juliuszlioba.com</span>,
              I value your privacy. This policy outlines how I handle data when you visit
              my website, which is hosted on Vercel.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">1. Data Collection & Analytics</h2>
            <p className="text-muted-foreground">
              I use <span className="text-foreground font-medium">Vercel Analytics</span> to monitor the health and performance
              of my website. This helps me understand how visitors interact with the site so I can improve the user experience.
            </p>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground font-medium">What I collect:</strong> I track page views, top HTTP referrers, and basic device information (browser type, OS, and country).
              </li>
              <li>
                <strong className="text-foreground font-medium">Privacy-First Approach:</strong> Vercel Analytics is designed to be privacy-friendly. It does <strong>not</strong> use cookies to track you across different websites.
              </li>
              <li>
                <strong className="text-foreground font-medium">Anonymization:</strong> The data collected is aggregated and anonymous. I do not collect or store Personal Identifiable Information (PII) such as your name, email, or IP address through this tool.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">2. Hosting & Infrastructure</h2>
            <p className="text-muted-foreground">
              My website is hosted by <span className="text-foreground font-medium">Vercel Inc.</span> When you access the site, Vercel’s servers may automatically log certain information, such as your IP address, to facilitate the delivery of the website and ensure security.
            </p>
            <p>
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="text-primary font-medium underline-offset-2 hover:opacity-80 transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Vercel Privacy Policy
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">3. Cookies</h2>
            <p className="text-muted-foreground">
              I do not use any non-essential tracking cookies or marketing cookies. Some essential technical cookies may be used by the hosting infrastructure to maintain the security and stability of your session.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">4. No Third-Party Data Sharing</h2>
            <p className="text-muted-foreground">
              I do not use any third-party services, plugins, or trackers (such as Google Analytics, advertisements, or social media pixels). Your data is not sold, traded, or shared with outside parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">5. Your Rights</h2>
            <p className="text-muted-foreground">
              Because the analytics I use are anonymous and I do not collect personal information through this site, I generally cannot link specific usage data back to an individual user.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">6. Contact Me</h2>
            <p className="text-muted-foreground italic">
              If you have any questions about this Privacy Policy, please reach out to me at:
            </p>
            <p className="text-lg font-medium tracking-tight">
              <a href="mailto:admin@juliuszlioba.com" className="text-primary underline-offset-2 hover:opacity-80 transition-opacity">
                admin@juliuszlioba.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
