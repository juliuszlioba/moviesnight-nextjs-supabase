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

export default function Login() {
  return (
    <div className="flex w-full items-center justify-center my-auto">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-light">Login</CardTitle>
            <CardDescription>
              Enter your email and password below to login
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <form className="grid gap-4">
                <Field>
                  <Input
                    id="email"
                    type="email"
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
                    autoComplete="password"
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
