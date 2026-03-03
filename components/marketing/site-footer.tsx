import Link from "next/link";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {siteConfig.footerNav.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              이용약관
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
