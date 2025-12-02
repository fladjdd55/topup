import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { 
  Smartphone, Globe, Shield, Heart, Users, Target, 
  ArrowRight, Zap, TrendingUp
} from "lucide-react";

export default function About() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleStartRecharge = () => {
    setLocation("/");
    setTimeout(() => {
      const rechargeSection = document.getElementById('recharge-section');
      if (rechargeSection) {
        rechargeSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const values = [
    {
      icon: Shield,
      titleKey: 'about.value_trust',
      descKey: 'about.value_trust_desc'
    },
    {
      icon: Zap,
      titleKey: 'about.value_innovation',
      descKey: 'about.value_innovation_desc'
    },
    {
      icon: Heart,
      titleKey: 'about.value_care',
      descKey: 'about.value_care_desc'
    },
    {
      icon: Globe,
      titleKey: 'about.value_accessibility',
      descKey: 'about.value_accessibility_desc'
    }
  ];

  const stats = [
    { value: "89", labelKey: 'about.stat_countries' },
    { value: "200+", labelKey: 'about.stat_operators' },
    { value: "99.9%", labelKey: 'about.stat_uptime' },
    { value: "24/7", labelKey: 'about.stat_support' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-18">
            <Link href="/">
              <div className="flex items-center cursor-pointer hover-elevate rounded-md px-2 py-1">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-lg">
                  T
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Taptopload
                </h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-home">
                  {t('nav.home')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.hero_title')}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('about.hero_description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Target className="w-4 h-4 mr-2" />
                {t('about.mission_badge')}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('about.mission_title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t('about.mission_desc1')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.mission_desc2')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t(stat.labelKey)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.values_title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('about.values_description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover-elevate">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t(value.titleKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t(value.descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.story_title')}
            </h2>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t('about.story_section1_title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('about.story_section1_desc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t('about.story_section2_title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('about.story_section2_desc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t('about.story_section3_title')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t('about.story_section3_desc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-purple-600">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {t('about.cta_title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('about.cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white text-primary hover:bg-gray-100 border-0"
              data-testid="button-start-recharging"
              onClick={handleStartRecharge}
            >
              {t('about.cta_start')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                data-testid="button-contact-us"
              >
                {t('about.cta_contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center text-gray-400 text-sm">
            &copy; 2025 Taptopload. {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
