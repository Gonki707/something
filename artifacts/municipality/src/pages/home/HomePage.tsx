import { useGetSiteSummary } from "@workspace/api-client-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowRight, Newspaper, Megaphone, Briefcase, FileText, Building, Gavel, Calendar } from "lucide-react";

export function HomePage() {
  const { data, isLoading, error } = useGetSiteSummary();

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState message="Грешка при вчитување на почетната страница." />;

  const { counts, latestNews, latestAnnouncements, openTenders, openCompetitions, latestGazette, latestProjects } = data;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Официјален веб портал на општината
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl leading-relaxed">
              Вашиот централен извор за сите новости, проекти, огласи и легислатива поврзани со развојот и функционирањето на локалната самоуправа. Транспарентно и отворено за сите граѓани.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link href="/novosti">Последни новости</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/proekti">Наши проекти</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <QuickLinkCard title="Новости" icon={<Newspaper className="h-6 w-6" />} href="/novosti" count={counts.find(c => c.section === 'news')?.count} />
            <QuickLinkCard title="Соопштенија" icon={<Megaphone className="h-6 w-6" />} href="/soopstenija" count={counts.find(c => c.section === 'announcements')?.count} />
            <QuickLinkCard title="Проекти" icon={<Building className="h-6 w-6" />} href="/proekti" count={counts.find(c => c.section === 'projects')?.count} />
            <QuickLinkCard title="Огласи" icon={<Briefcase className="h-6 w-6" />} href="/oglasi" count={counts.find(c => c.section === 'tenders')?.count} />
            <QuickLinkCard title="Конкурси" icon={<FileText className="h-6 w-6" />} href="/konkursi" count={counts.find(c => c.section === 'competitions')?.count} />
            <QuickLinkCard title="Службен гласник" icon={<FileText className="h-6 w-6" />} href="/sluzben-glasnik" count={counts.find(c => c.section === 'gazette')?.count} />
            <QuickLinkCard title="Легислатива" icon={<Gavel className="h-6 w-6" />} href="/legislativa" count={counts.find(c => c.section === 'legislation')?.count} />
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 md:px-8 py-16 space-y-24">
        
        {/* Latest News */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Актуелни новости</h2>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/novosti">Види ги сите <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map(news => (
              <Card key={news.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {news.coverImageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img src={news.coverImageUrl} alt={news.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{news.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {formatDate(news.publishedAt)}</span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight">
                    <Link href={`/novosti/${news.id}`} className="hover:text-primary transition-colors">
                      {news.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm">{news.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" asChild className="w-full mt-6 md:hidden">
            <Link href="/novosti">Види ги сите новости</Link>
          </Button>
        </section>

        {/* Featured Projects & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Announcements */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">Соопштенија</h2>
              <Link href="/soopstenija" className="text-primary hover:underline text-sm font-medium">Сите соопштенија</Link>
            </div>
            <div className="space-y-4">
              {latestAnnouncements.slice(0, 4).map(ann => (
                <div key={ann.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="text-xs text-muted-foreground mb-1">{formatDate(ann.publishedAt)}</div>
                  <Link href={`/soopstenija/${ann.id}`} className="font-semibold text-foreground hover:text-primary block mb-1">
                    {ann.title}
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ann.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Open Tenders & Competitions */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">Отворени огласи и конкурси</h2>
            </div>
            <div className="space-y-4">
              {openTenders.slice(0, 2).map(tender => (
                <div key={tender.id} className="p-4 rounded-lg border-l-4 border-l-secondary bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Оглас</span>
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                      Рок: {formatDate(tender.deadline)}
                    </span>
                  </div>
                  <Link href={`/oglasi/${tender.id}`} className="font-semibold text-foreground hover:text-primary block mb-2">
                    {tender.title}
                  </Link>
                </div>
              ))}
              {openCompetitions.slice(0, 2).map(comp => (
                <div key={comp.id} className="p-4 rounded-lg border-l-4 border-l-primary bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Конкурс</span>
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                      Рок: {formatDate(comp.deadline)}
                    </span>
                  </div>
                  <Link href={`/konkursi/${comp.id}`} className="font-semibold text-foreground hover:text-primary block mb-2">
                    {comp.title}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

function QuickLinkCard({ title, icon, href, count }: { title: string; icon: React.ReactNode; href: string; count?: number }) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200">
        <CardHeader className="p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {count !== undefined && (
            <CardDescription className="font-medium mt-1">
              {count} {count === 1 ? 'запис' : 'записи'}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
