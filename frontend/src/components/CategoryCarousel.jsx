import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer",
    "Cloud Architect"
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className="w-full max-w-xl mx-auto my-20">
        <Carousel>
          <CarouselContent>
            {category.map((cat, index) => (
              <CarouselItem 
                key={index} 
                className="md:basis-1/3 lg:basis-1/3 px-1"
              >
                <Button 
                  onClick={() => searchJobHandler(cat)} 
                  variant="outline" 
                  className="rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white hover:text-white hover:opacity-90 transition-opacity duration-300"
                >
                  {cat}
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    )
}

export default CategoryCarousel