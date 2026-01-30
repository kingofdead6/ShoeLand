import React from 'react';

import Hero from '../Components/Home/Hero';
import Categories from '../Components/Home/Categories';
import ProductCarousel from '../Components/Home/ProductsCarousel';
import FAQ from '../Components/Home/FAQ';

const HomePage = () => {
  return (
    <div>
      <Hero />

      <ProductCarousel 
        titleKey="trendingProducts"   
        reverse={false} 
        endpoint="trending" 
      />

      <ProductCarousel 
        titleKey="bestOffers"         
        reverse={true} 
        endpoint="best-offers" 
      />
      <Categories />
      <FAQ />
    </div>
  );
};

export default HomePage;