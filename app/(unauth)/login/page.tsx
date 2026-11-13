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
    <div className="flex w-full items-center justify-center my-auto">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-light">Login</CardTitle>
            <CardDescription>
              Enter your email and password below to login
            </CardDescription>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                Invalid email or password.
              </p>
            )}
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <form className="grid gap-4">
                <Field>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    name="email"
                    placeholder="email"
                    required
                  />
                </Field>

                <Field>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="password"
                    autoComplete="current-password"
                    required
                  />
                </Field>

                <FieldGroup>
                  <Field>
                    <SubmitButton
                      formAction={signIn}
                      pendingText="Logging In..."
                    >
                      Login
                    </SubmitButton>
                  </Field>
                </FieldGroup>
              </form>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
