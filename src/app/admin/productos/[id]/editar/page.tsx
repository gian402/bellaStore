import ProductForm from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return <ProductForm productId={id} />;
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  return {
    title: `Editar producto ${id} - Admin BellaStore`,
  };
}
