import Link from "next/link";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Fingerprint, Shield, Lock, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-main">
      {/* Hero Section */}
      <section
        className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted"
        style={{
          backgroundImage: "url('/bg-image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <div className="container px-4 md:px-10 pt-12 md:pt-24 lg:pt-32 xl:pt-48">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  eKYC Platform Authentication
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Secure and seamless eKYC with biometrics – fast, reliable
                  customer authentication!
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Advanced Biometric Security
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform offers cutting-edge biometric authentication
                methods to keep your identity secure.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <Fingerprint className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Fingerprint Recognition</CardTitle>
                <CardDescription>
                  Advanced fingerprint scanning with 99.9% accuracy and liveness
                  detection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Multi-finger support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Anti-spoofing technology</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Works with most devices</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <Shield className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Facial Recognition</CardTitle>
                <CardDescription>
                  State-of-the-art facial recognition with depth sensing and
                  expression analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>3D face mapping</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Works in low light</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Mask detection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <Lock className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Voice Authentication</CardTitle>
                <CardDescription>
                  Secure voice pattern recognition with natural language
                  processing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Dynamic passphrase support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Background noise filtering</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>Voice clone detection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold text-primary">99.9%</div>
              <div className="text-xl font-medium">Authentication Accuracy</div>
              <p className="text-muted-foreground">
                Our biometric systems provide near-perfect accuracy in identity
                verification.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold text-primary">500ms</div>
              <div className="text-xl font-medium">Average Response Time</div>
              <p className="text-muted-foreground">
                Lightning-fast authentication that doesn&apos;t keep you
                waiting.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold text-primary">10M+</div>
              <div className="text-xl font-medium">Users Protected</div>
              <p className="text-muted-foreground">
                Trusted by millions of users and enterprises worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Secure Your Digital Identity?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Join thousands of businesses and individuals who trust our
                platform for their security needs.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
