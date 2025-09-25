import { Body, Controller, Post, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @UseInterceptors(CacheInterceptor)
  @Post()
  recommend(@Body() body: unknown) {
    return this.recommendationService.recommend(body);
  }
}
