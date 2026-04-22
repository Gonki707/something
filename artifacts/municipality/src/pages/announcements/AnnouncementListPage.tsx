import { useListAnnouncements } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ListFilters } from "@/components/shared/ListFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Megaphone } from "lucide-react";

export function AnnouncementListPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const q = searchParams.get("q") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const category = searchParams.get("category") || undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const pageSize = 12;

  const { data, isLoading, error } = useListAnnouncements({ q, year, category, page, pageSize });

  const updateFilters = (key: string, value: any) => {
    const params = new URLSearchParams(window.location.search);
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    setLocation(`?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" /> Соопштенија
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Важни информации и известувања за граѓаните на општината.
        </p>
      </div>

      <ListFilters
        q={q}
        year={year}
        category={category}
        availableYears={data?.availableYears}
        availableCategories={data?.availableCategories}
        onFilterChange={updateFilters}
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : data?.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data?.items.map(item => (
              <Card key={item.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 bg-muted/30 p-6 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r">
                    <Calendar className="h-6 w-6 text-primary mb-2" />
                    <div className="font-semibold text-lg">{formatDate(item.publishedAt)}</div>
                    <div className="text-xs text-muted-foreground mt-1 bg-background px-2 py-1 rounded-full border">{item.category}</div>
                  </div>
                  <div className="flex-1 p-6">
                    <h2 className="text-xl font-serif font-bold mb-3">
                      <Link href={`/soopstenija/${item.id}`} className="hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground">{item.summary}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {data && (
            <PaginationControls
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => updateFilters("page", p)}
            />
          )}
        </>
      )}
    </div>
  );
}
