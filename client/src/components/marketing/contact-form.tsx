import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { site } from "@/config/site";

export interface ContactFormValues {
  name: string;
  organisation: string;
  email: string;
  message: string;
}

/**
 * Transport abstraction. The default opens the visitor's email client via a
 * mailto: link. This can later be replaced with a real API submission
 * (POST /api/contact) without changing the form UI — only this function.
 */
export type ContactTransport = (values: ContactFormValues, opts: { subject: string }) => void;

function buildMailto(values: ContactFormValues, subject: string): string {
  const body = [
    `Naam / Name: ${values.name}`,
    `Organisatie / Organisation: ${values.organisation}`,
    `E-mail: ${values.email}`,
    "",
    values.message,
  ].join("\n");
  return `mailto:${site.emails.general}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

const defaultTransport: ContactTransport = (values, { subject }) => {
  window.location.href = buildMailto(values, subject);
};

export function ContactForm({
  transport = defaultTransport,
}: {
  transport?: ContactTransport;
}) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t("corp.contact.form.validation.nameRequired")),
    organisation: z.string().min(1, t("corp.contact.form.validation.organisationRequired")),
    email: z
      .string()
      .min(1, t("corp.contact.form.validation.emailRequired"))
      .email(t("corp.contact.form.validation.emailInvalid")),
    message: z.string().min(1, t("corp.contact.form.validation.messageRequired")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: ContactFormValues) => {
    transport(values, { subject: t("corp.contact.form.subject") });
    setOpened(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="contact-name">{t("corp.contact.form.name")}</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          placeholder={t("corp.contact.form.namePlaceholder")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          data-testid="input-contact-name"
          {...register("name")}
        />
        {errors.name && (
          <p id="contact-name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-organisation">{t("corp.contact.form.organisation")}</Label>
        <Input
          id="contact-organisation"
          autoComplete="organization"
          placeholder={t("corp.contact.form.organisationPlaceholder")}
          aria-invalid={!!errors.organisation}
          aria-describedby={errors.organisation ? "contact-organisation-error" : undefined}
          data-testid="input-contact-organisation"
          {...register("organisation")}
        />
        {errors.organisation && (
          <p id="contact-organisation-error" className="text-sm text-destructive">
            {errors.organisation.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">{t("corp.contact.form.email")}</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder={t("corp.contact.form.emailPlaceholder")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          data-testid="input-contact-email"
          {...register("email")}
        />
        {errors.email && (
          <p id="contact-email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("corp.contact.form.message")}</Label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder={t("corp.contact.form.messagePlaceholder")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          data-testid="input-contact-message"
          {...register("message")}
        />
        {errors.message && (
          <p id="contact-message-error" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full sm:w-auto" data-testid="button-contact-submit">
        <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
        {t("corp.contact.form.submit")}
      </Button>

      <p className="text-sm text-muted-foreground" role={opened ? "status" : undefined}>
        {t("corp.contact.form.mailtoNote")}
      </p>
    </form>
  );
}
