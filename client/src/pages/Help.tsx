import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Book, MessageCircle, FileText, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function Help() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    { icon: Book, key: 'getting_started', link: '/help/getting-started' },
    { icon: MessageCircle, key: 'payments', link: '/help/payments' },
    { icon: FileText, key: 'account', link: '/help/account' },
    { icon: HelpCircle, key: 'troubleshooting', link: '/help/troubleshooting' }
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
          {t('help.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {t('help.subtitle')}
        </p>

        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('help.search_placeholder')}
              className="pl-10"
              data-testid="input-help-search"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {helpCategories.map((category) => (
            <Card key={category.key} className="hover-elevate cursor-pointer">
              <CardContent className="p-6">
                <category.icon className="w-12 h-12 text-gray-900 dark:text-white mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`help.${category.key}_title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(`help.${category.key}_desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('help.still_need_help')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('help.contact_support')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button data-testid="button-contact-support">
                {t('footer.contact')}
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" data-testid="button-view-faq">
                {t('footer.faq')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
