import { card } from "../ui";

// Centered card used by the login and register pages.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-sm pt-4 sm:pt-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className={`${card} p-6 sm:p-8`}>{children}</div>
      {footer && <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>}
    </div>
  );
}
