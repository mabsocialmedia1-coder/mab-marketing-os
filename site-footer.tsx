import { Phone, Mail, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-taupe/15 bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-center sm:px-6 md:flex-row md:justify-between md:text-start">
        <div>
          <div className="font-semibold text-taupe">M.A.B Marketing USA</div>
          <div className="font-script text-lg leading-none text-taupe-light">
            Your success is my success!
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-taupe-light sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-5">
          <span className="inline-flex items-center justify-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            +1 941-250-4430
          </span>
          <span className="inline-flex items-center justify-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            mabsocialmedia@gmail.com
          </span>
          <span className="inline-flex items-center justify-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            9725 NW 37th St, Sunrise FL 33351
          </span>
        </div>
      </div>
    </footer>
  )
}
