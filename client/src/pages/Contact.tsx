import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Clock, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Bonjour TapTopLoad, j'ai besoin d'aide.");
    const whatsappUrl = `https://wa.me/50943915927?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

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
          {t('contact.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          {t('contact.subtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Email Card */}
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('contact.email_title')}
              </h3>
              <a 
                href="mailto:support@taptopload.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                data-testid="link-email"
              >
                support@taptopload.com
              </a>
            </CardContent>
          </Card>

          {/* Support Hours Card */}
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('contact.hours_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('contact.hours_content')}
              </p>
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <Card className="hover-elevate">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <SiWhatsapp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('contact.whatsapp_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {t('contact.whatsapp_desc')}
              </p>
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('contact.whatsapp_button')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('faq.more_questions')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('faq.contact_us')}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/faq">
                <Button variant="outline" data-testid="button-faq">
                  FAQ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
