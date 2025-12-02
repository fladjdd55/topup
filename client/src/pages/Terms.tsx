import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back_home')}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('terms.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('terms.last_updated')}: {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section1_title')}
            </h2>
            <p>{t('terms.section1_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section2_title')}
            </h2>
            <p>{t('terms.section2_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section3_title')}
            </h2>
            <p>{t('terms.section3_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section4_title')}
            </h2>
            <p>{t('terms.section4_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.section5_title')}
            </h2>
            <p>{t('terms.section5_content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
