import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    { id: '1', q: 'faq.q1', a: 'faq.a1' },
    { id: '2', q: 'faq.q2', a: 'faq.a2' },
    { id: '3', q: 'faq.q3', a: 'faq.a3' },
    { id: '4', q: 'faq.q4', a: 'faq.a4' },
    { id: '5', q: 'faq.q5', a: 'faq.a5' },
    { id: '6', q: 'faq.q6', a: 'faq.a6' },
    { id: '7', q: 'faq.q7', a: 'faq.a7' },
    { id: '8', q: 'faq.q8', a: 'faq.a8' }
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
          {t('faq.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          {t('faq.subtitle')}
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left text-gray-900 dark:text-white">
                {t(faq.q)}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                {t(faq.a)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('faq.more_questions')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('faq.contact_us')}
          </p>
          <Link href="/contact">
            <Button>{t('footer.contact')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
