import { Link } from "wouter";
import { Landmark } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-serif font-bold text-xl text-primary mb-4">
              <Landmark className="h-6 w-6" />
              <span>Општина</span>
            </Link>
            <p className="text-sm">
              Официјален веб портал на општината. Транспарентност, отвореност и отчетност кон граѓаните.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Информации</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/novosti" className="hover:text-primary transition-colors">Новости</Link></li>
              <li><Link href="/soopstenija" className="hover:text-primary transition-colors">Соопштенија</Link></li>
              <li><Link href="/proekti" className="hover:text-primary transition-colors">Проекти</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Услуги</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/oglasi" className="hover:text-primary transition-colors">Огласи</Link></li>
              <li><Link href="/konkursi" className="hover:text-primary transition-colors">Конкурси</Link></li>
              <li><Link href="/sluzben-glasnik" className="hover:text-primary transition-colors">Службен гласник</Link></li>
              <li><Link href="/legislativa" className="hover:text-primary transition-colors">Легислатива</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Контакт</h3>
            <ul className="space-y-2 text-sm">
              <li>Бул. Илинден бр. 1</li>
              <li>1000 Скопје, Р. Северна Македонија</li>
              <li>Телефон: +389 2 123 4567</li>
              <li>Е-пошта: info@opstina.gov.mk</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Општина. Сите права се задржани.</p>
        </div>
      </div>
    </footer>
  );
}
