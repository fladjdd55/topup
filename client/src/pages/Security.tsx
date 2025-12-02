import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, Server } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Security() {
  const { t } = useLanguage();

  const securityFeatures = [
    { icon: Shield, key: 'ssl' },
    { icon: Lock, key: 'encryption' },
    { icon: Eye, key: 'privacy' },
    { icon: Server, key: 'infrastructure' }
  ];

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
          {t('security.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          {t('security.subtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {securityFeatures.map((feature) => (
            <Card key={feature.key}>
              <CardContent className="p-6">
                <feature.icon className="w-12 h-12 text-gray-900 dark:text-white mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`security.${feature.key}_title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(`security.${feature.key}_desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('security.commitment_title')}
            </h2>
            <p>{t('security.commitment_content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
