import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Navigation } from "@/components/navigation";
import { PropertyDetail } from "@/components/property-detail";
import { fetchPlaceById } from "@/api/places";

export default function PropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchPlaceById(id)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setProperty(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Unable to load property");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (notFound) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {loading && (
        <div className="pt-40 text-center text-gray-500">Loading property...</div>
      )}
      {error && !loading && (
        <div className="pt-40 text-center text-red-600">{error}</div>
      )}
      {!loading && !error && property && <PropertyDetail property={property} />}
    </div>
  );
}
