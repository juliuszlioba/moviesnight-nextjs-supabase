import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "./submit-button";
import { signIn } from "./actions";

export default async function Login(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { error } = (await props.searchParams) || {};

  return (
    <main id="main-content" className="flex w-full items-center justify-center my-auto">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-light">Log In</CardTitle>
            <CardDescription>
              Enter your email and password below to log in.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <form className="grid gap-4">
                <Field>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    aria-label="Email"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "login-error" : undefined}
                    spellCheck={false}
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                </Field>

                <Field>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    aria-label="Password"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "login-error" : undefined}
                    required
                  />
                </Field>

                {error && (
                  <p id="login-error" role="alert" className="text-sm text-destructive">
                    Invalid email or password. Check your details and try again.
                  </p>
                )}

                <FieldGroup>
                  <Field>
                    <SubmitButton
                      formAction={signIn}
                      pendingText="Logging In…"
                    >
                      Log In
                    </SubmitButton>
                  </Field>
                </FieldGroup>
              </form>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
