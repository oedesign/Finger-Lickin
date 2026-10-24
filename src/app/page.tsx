import { Brand } from "@/components/shared/brand";
import { FoodIllustration } from "@/components/shared/food-illustration";
import { PageContainer, SectionHeading } from "@/components/shared/page-layout";
import { PreviewDialog } from "@/components/shared/preview-dialog";
import { StorefrontHeader } from "@/components/shared/storefront-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

const principles = [
  {
    number: "01",
    title: "Good food, made easier to find",
    description:
      "A calmer, more considered way to bring independent kitchens and the people nearby together.",
  },
  {
    number: "02",
    title: "Built with restaurants in mind",
    description:
      "A marketplace should make room for the care, craft, and character behind every local kitchen.",
  },
  {
    number: "03",
    title: "Clear from first look to last",
    description:
      "Useful information, understandable states, and thoughtful details belong in every part of the experience.",
  },
];

const audiences = [
  {
    number: "01",
    label: "For customers",
    title: "A seat at the table",
    description:
      "A welcoming place to discover the independent restaurants that make a neighbourhood feel like home.",
    tone: "bg-brand-50 text-brand-800",
  },
  {
    number: "02",
    label: "For restaurant teams",
    title: "A space for the makers",
    description:
      "A considered home for the people, menus, and stories behind every restaurant.",
    tone: "bg-leaf-50 text-leaf-800",
  },
  {
    number: "03",
    label: "For operations",
    title: "A steadier view",
    description:
      "A clear operational foundation for the people responsible for keeping a marketplace on track.",
    tone: "bg-info-surface text-info-ink",
  },
];

export default function Home() {
  return (
    <>
      <StorefrontHeader />
      <main id="main-content">
        <section className="bg-leaf-900 relative isolate overflow-hidden py-12 text-white sm:py-16 lg:py-20">
          <span
            aria-hidden="true"
            className="hero-ornament -top-72 -right-28 size-[36rem]"
          />
          <span
            aria-hidden="true"
            className="hero-ornament -top-24 -right-8 size-[25rem]"
          />
          <PageContainer className="relative grid items-center gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12">
            <div className="relative z-10 max-w-2xl">
              <Badge className="border-white/20 bg-white/10 text-white">
                A marketplace in the making
              </Badge>
              <h1 className="font-display text-display mt-7 text-white">
                A little closer to{" "}
                <span className="text-spice-300">good food.</span>
              </h1>
              <p className="sm:text-body-lg mt-7 max-w-xl text-base leading-7 text-white/80">
                Finger-Lickin is being built around the independent restaurants,
                memorable meals, and neighbourhoods that bring us together.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="#our-approach" size="lg" variant="primary">
                  Meet the marketplace
                  <svg
                    aria-hidden="true"
                    className="size-4"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M4 10h12m-5-5 5 5-5 5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </ButtonLink>
                <ButtonLink href="#workspaces" size="lg" variant="inverse">
                  Who it is for
                </ButtonLink>
              </div>
              <p className="mt-6 text-xs leading-5 text-white/65">
                A design preview. Ordering and account features are not
                available yet.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-[34rem]">
              <div
                aria-hidden="true"
                className="absolute -top-5 -left-3 size-16 rounded-full border border-white/25 sm:-left-7 sm:size-20"
              />
              <div className="rounded-panel shadow-panel relative overflow-hidden border border-white/40 bg-[#f2e9d9] p-3 sm:p-5">
                <FoodIllustration />
                <div className="border-border/70 bg-surface/95 shadow-card absolute right-5 bottom-5 left-5 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 sm:right-8 sm:bottom-8 sm:left-8 sm:px-5 sm:py-4">
                  <div>
                    <p className="text-muted text-xs leading-4 font-semibold tracking-wide uppercase">
                      Made for
                    </p>
                    <p className="text-ink mt-1 text-sm font-bold sm:text-base">
                      The neighbourhood table
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="bg-spice-100 text-spice-700 flex size-10 shrink-0 items-center justify-center rounded-full"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 3.5c1.1 3.15 3.35 5.4 6.5 6.5-3.15 1.1-5.4 3.35-6.5 6.5-1.1-3.15-3.35-5.4-6.5-6.5 3.15-1.1 5.4-3.35 6.5-6.5Zm7 11c.58 1.67 1.77 2.86 3.5 3.5-1.73.64-2.92 1.83-3.5 3.5-.64-1.67-1.83-2.86-3.5-3.5 1.67-.64 2.86-1.83 3.5-3.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        <section
          aria-labelledby="approach-title"
          className="py-section"
          id="our-approach"
        >
          <PageContainer>
            <SectionHeading
              description="Not just a way to find a meal. A thoughtful marketplace starts with the people and places that make food worth sharing."
              eyebrow="A good thing takes care"
              title="Made for more than the menu."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
              {principles.map((principle) => (
                <Card className="h-full" key={principle.number}>
                  <CardContent className="grid h-full content-start gap-7">
                    <span
                      aria-hidden="true"
                      className="font-display bg-surface-soft text-brand-700 flex size-12 items-center justify-center rounded-full text-lg"
                    >
                      {principle.number}
                    </span>
                    <div className="grid gap-3">
                      <CardTitle>{principle.title}</CardTitle>
                      <CardDescription className="text-base leading-7">
                        {principle.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PageContainer>
        </section>

        <section
          aria-labelledby="workspaces-title"
          className="border-border bg-surface-soft py-section border-y"
          id="workspaces"
        >
          <PageContainer>
            <SectionHeading
              align="center"
              description="One shared vision, with the right space for everyone who makes a food marketplace work."
              eyebrow="Around the table"
              id="workspaces-title"
              title="A place for everyone who makes it happen."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
              {audiences.map((audience) => (
                <Card className="h-full" key={audience.number}>
                  <CardContent className="grid h-full content-start gap-6">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className={audience.tone}>{audience.label}</Badge>
                      <span
                        aria-hidden="true"
                        className="font-display text-subtle text-sm"
                      >
                        {audience.number}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      <CardTitle>{audience.title}</CardTitle>
                      <CardDescription className="text-base leading-7">
                        {audience.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PageContainer>
        </section>

        <section className="py-10 sm:py-12">
          <PageContainer>
            <div className="rounded-panel bg-brand-50 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-2xl">
                <p className="text-brand-800 text-xs leading-5 font-bold tracking-[0.16em] uppercase">
                  Thoughtfully built, one step at a time
                </p>
                <p className="text-brand-900 mt-2 text-sm leading-6">
                  The marketplace is still being made. This preview does not
                  accept orders or account details.
                </p>
              </div>
              <Badge className="border-brand-200 bg-surface text-brand-800 w-fit">
                Foundation preview
              </Badge>
            </div>
          </PageContainer>
        </section>
      </main>

      <footer className="border-border bg-surface border-t py-8">
        <PageContainer className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-2">
            <Brand size="sm" />
            <p className="text-muted text-xs leading-5">
              A little preview of what Finger-Lickin is being built to become.
            </p>
          </div>
          <PreviewDialog />
        </PageContainer>
      </footer>
    </>
  );
}
