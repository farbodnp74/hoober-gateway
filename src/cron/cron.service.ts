import { Injectable } from '@nestjs/common';
import { Cron ,CronExpression } from '@nestjs/schedule';
import axios from "axios";
import { BlogTypeEnum } from '../base/blog/enums/blog-type.enum';
import { Blog } from 'src/base/blog/entities/blog.entity';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { KavenegarService } from 'src/base/kavenegar/kavenegar.service';
import { OneTimePassword } from 'src/users/registration/entities/one-time-password.entity';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class CronService {
  constructor(
    private readonly kavenegarService: KavenegarService, 
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectDataSource() private readonly dataSource: DataSource)
     { }


    @Cron(CronExpression.EVERY_6_HOURS )
    async getblogs() {
        console.log('get blogs cron job')
        const response_type_a = await axios.get(
            `https://blog.vardast.com/wp-json/wp/v2/posts?per_page=1&_embed&categories=4`,
        );
        const response_type_b = await axios.get(
            `https://blog.vardast.com/wp-json/wp/v2/posts?per_page=3&_embed&categories=24`,
        );
        const response_type_c = await axios.get(
            `https://blog.vardast.com/wp-json/wp/v2/posts?per_page=1&_embed&categories=5`,
        );
    
        const posts = [...response_type_a.data, ...response_type_b.data, ...response_type_c.data];
    
        posts.map(async post => {
            const date = post.date;
            const dataUrl = post.link;
            const title = post.title.rendered;
            const description = post.excerpt.rendered;
            let categoryId;
    
            if (response_type_a.data.includes(post)) {
                categoryId = BlogTypeEnum.RESPONSE_TYPE_A;
            } else if (response_type_b.data.includes(post)) {
                categoryId = BlogTypeEnum.RESPONSE_TYPE_B;
            } else if (response_type_c.data.includes(post)) {
                categoryId = BlogTypeEnum.RESPONSE_TYPE_C;
            }
    
            const image_url = post?._embedded["wp:featuredmedia"]?.[0]?.media_details?.sizes
                ?.medium_large?.source_url || "";
            const newBlog = await this.createBlog(
                dataUrl,
                title,
                image_url,
                description,
                categoryId,
                date
            );
    
            return newBlog;
        });
    
    }  

   @Cron(CronExpression.EVERY_5_SECONDS) 
   async  sendOTP() {
     const job : any = await this.cacheManager.get('sendotpjob');
      if ( job ) {
        console.log('Another cron job is already running. Exiting function.');
        return null
      }
      const allKeys: string[] = await this.cacheManager.store.keys();
      console.log('allkeys',allKeys)
      console.log('date',new Date().toLocaleString("en-US", {timeZone: "Asia/Tehran"}))
      const OTPS: string[] = allKeys.filter(key =>
          key.startsWith("lastUnexpiredOtp_"),
      );
      if (OTPS.length > 0) {
        await this.cacheManager.set('sendotpjob', {start : new Date()} , OTPS.length * 1000); 
      }
        
      for (const key of OTPS) {
          try {
              const phoneNumber = key.match(/lastUnexpiredOtp_{phone:(\d+)}/)[1];
              const token : any = await this.cacheManager.store.get(key);
              const decompressedResult : OneTimePassword = this.decompressionService.decompressData(token);
              await this.kavenegarService.lookup(phoneNumber, "verify", decompressedResult.token);
              await this.cacheManager.del(key) 
          } catch (e) {
              console.log('Error occurred while processing OTP:', e);
              break;
          }
          
      }
     
    }

    @Cron(CronExpression.EVERY_DAY_AT_9AM ) 
    async updateProductRating(): Promise<void> {
          let offset = 0;
          let totalCount = 0;
          const batchSize = 100;
          try {
              const totalCountQuery = `
                  SELECT COUNT(*) AS total_count FROM products;
              `;
              const totalCountResult = await this.dataSource.query(totalCountQuery);
              totalCount = parseInt(totalCountResult[0].total_count);
      
              while (offset < totalCount) {
                  const sql = `
                        UPDATE products AS p
                        SET rating = 
                            CASE
                                WHEN EXISTS (
                                    SELECT 1
                                    FROM product_prices AS pp
                                    WHERE pp."productId" = p."id"
                                    AND pp."createdAt" > NOW() - INTERVAL '7 days'
                                    AND pp."createdAt" <= NOW() -- Price is between now and 7 days ago
                                ) THEN 4 -- Update rating to 4 if the price is between now and 7 days ago
                                WHEN EXISTS (
                                    SELECT 1
                                    FROM product_prices AS pp
                                    WHERE pp."productId" = p."id"
                                    AND pp."createdAt" <= NOW() - INTERVAL '7 days' -- Price is more than 7 days old
                                ) THEN 3 -- Update rating to 3 if the price is more than 7 days old
                                WHEN EXISTS (
                                    SELECT 1
                                    FROM product_images AS pi
                                    WHERE pi."productId" = p."id"
                                ) THEN 2 -- Update rating to 2 if there is an image
                                ELSE 1 -- Otherwise, update rating to 1
                            END
                        WHERE p.id IN (
                            SELECT id
                            FROM products
                            LIMIT ${batchSize}
                            OFFSET ${offset}
                        );
                  `;
      
                  await this.dataSource.query(sql);
      
                  offset += batchSize;
              }
      
              console.log('Product ratings updated successfully.');
          } catch (error) {
              console.error('Error updating product ratings:', error);
          }
    }

    
    @Cron(CronExpression.EVERY_DAY_AT_10AM ) 
    async updateProductOffer(): Promise<void> {
          let offset = 0;
          let totalCount = 0;
          const batchSize = 100;
          try {
              const totalCountQuery = `
                  SELECT COUNT(*) AS total_count FROM products;
              `;
              const totalCountResult = 
              await this.dataSource.query(totalCountQuery);
              totalCount = 
              parseInt(
                totalCountResult[0].total_count
             );
              while (offset < totalCount) {
                  const sql = `
                        UPDATE products AS p
                        SET offers_count = (
                            SELECT COUNT(*)
                            FROM product_offers AS o
                            WHERE o."productId" = p.id
                        )
                        WHERE p.id IN (
                            SELECT id
                            FROM products
                            LIMIT ${batchSize}
                            OFFSET ${offset}
                        );
                  
                    `;
      
                  await this.dataSource.query(sql);
      
                  offset += batchSize;

                  await new Promise(resolve => setTimeout(resolve, 1000));
              }
      
              console.log('Product ratings updated successfully.');
          } catch (error) {
              console.error('Error updating product ratings:', error);
          }
    }
    @Cron(CronExpression.EVERY_DAY_AT_7AM   ) 
    async updateBrandCataloge(): Promise<void> {
          try {
            const sql = `
            UPDATE product_brands 
            SET "hasCatalogeFile" = TRUE
            WHERE EXISTS (
                SELECT 1
                FROM brand_files  bf
                WHERE product_brands.id = bf."brandId"
                AND bf.type = 'CATALOGUE'
            );
        
            `;
      
            await this.dataSource.query(sql);
            console.log('brand CATALOGUE updated successfully.');
          } catch (error) {
              console.error('Error updating brand CATALOGUE:', error);
          }
    }

    @Cron(CronExpression.EVERY_DAY_AT_6AM   ) 
    async updateBrandPrice(): Promise<void> {
          try {
            const sql = `
            UPDATE product_brands 
            SET "hasPriceList" = TRUE
            WHERE EXISTS (
                SELECT 1
                FROM brand_files  bf
                WHERE product_brands.id = bf."brandId"
                AND bf.type = 'PRICELIST'
            );
        
            `;
      
            await this.dataSource.query(sql);
            console.log('brand PRICELIST updated successfully.');
          } catch (error) {
              console.error('Error updating brand PRICELIST:', error);
          }
    }

    @Cron(CronExpression.EVERY_DAY_AT_5AM  ) 
    async updateCategoryProductCount(): Promise<void> {
          let offset = 0;
          let totalCount = 0;
          const batchSize = 100;
          try {
              const totalCountQuery = `
                  SELECT COUNT(*) AS total_count FROM base_taxonomy_categories;
              `;
              const totalCountResult = await this.dataSource.query(totalCountQuery);
              totalCount = parseInt(totalCountResult[0].total_count);
      
              while (offset < totalCount) {
                const sql = `
                        UPDATE base_taxonomy_categories AS cat
                        SET products_count = (
                            SELECT COUNT(*)
                            FROM parent_product AS p
                            WHERE p."categoryId" = cat.id
                        )    
                        WHERE cat.id IN (
                            SELECT id
                            FROM base_taxonomy_categories
                            ORDER BY id DESC
                            LIMIT ${batchSize}
                            OFFSET ${offset}
                        );
                `;
      
                  await this.dataSource.query(sql);
      
                  offset += batchSize;

                  await new Promise(resolve => setTimeout(resolve, 1000));
              }
      
              console.log('update Category Product Count updated successfully.');
          } catch (error) {
              console.error('Error update Category Product Count updated :', error);
          }
    }

    @Cron(CronExpression.EVERY_DAY_AT_3AM   ) 
    async updateCategoryCount(): Promise<void> {
          let offset = 0;
          let totalCount = 0;
          const batchSize = 100;
          try {
              const totalCountQuery = `
                  SELECT COUNT(*) AS total_count FROM product_brands;
              `;
              const totalCountResult = await this.dataSource.query(totalCountQuery);
              totalCount = parseInt(totalCountResult[0].total_count);
      
              while (offset < totalCount) {
                const sql = `
                        UPDATE product_brands AS br
                        SET "categoriesCount" = (
                        SELECT COUNT(DISTINCT "categoryId")
                        FROM parent_product AS p
                        WHERE p."brandId" = br.id 
                        )
                        WHERE br.id IN (
                            SELECT id
                            FROM product_brands
                            ORDER BY id DESC
                            LIMIT ${batchSize}
                            OFFSET ${offset}
                        );
                `;
      
                  await this.dataSource.query(sql);
      
                  offset += batchSize;

                  await new Promise(resolve => setTimeout(resolve, 1000));
              }
      
              console.log('update brand category Count updated successfully.');
          } catch (error) {
              console.error('Error update Category Product Count updated :', error);
          }
    }

    
    @Cron(CronExpression.EVERY_DAY_AT_8AM   ) 
    async updateSellerCount(): Promise<void> {
          let offset = 0;
          let totalCount = 0;
          const batchSize = 100;
          try {
              const totalCountQuery = `
                  SELECT COUNT(*) AS total_count FROM product_brands;
              `;
              const totalCountResult = await this.dataSource.query(totalCountQuery);
              totalCount = parseInt(totalCountResult[0].total_count);
      
              while (offset < totalCount) {
                const sql = `
                UPDATE product_brands AS br
                SET "sellersCount" = (
                    SELECT COUNT(DISTINCT product_offers."sellerId")
                    FROM parent_product AS p
                    INNER JOIN products ON p.id = products."parentId"
                    INNER JOIN product_offers ON products.id = product_offers."productId"
                    WHERE p."brandId" = br.id
                )
                WHERE br.id IN (
                    SELECT id
                    FROM product_brands
                    ORDER BY id DESC
                    LIMIT ${batchSize}
                    OFFSET ${offset}
                );

                
                `;
      
                  await this.dataSource.query(sql);
      
                  offset += batchSize;

                  await new Promise(resolve => setTimeout(resolve, 1000));
              }
      
              console.log('update seller Count updated successfully.');
          } catch (error) {
              console.error('Error update seller Count updated :', error);
          }
    }

    async createBlog(
        url: string,
        title: string,
        image_url: string,
        description: string,
        categoryId: number,
        date:string
      ): Promise<Blog> {
        if (title) {
          try {
            let blog = await Blog.findOneBy({
              url: url,
              title: title,
              image_url: image_url,
            });
    
            if (blog) {
              return blog;
            }
    
            blog = Blog.create({
              url,
              title,
              image_url,
              description,
              categoryId,
              date
            });
    
            await blog.save();
            return blog;
          } catch (error) {
            console.error(error);
          }
        }
    }

    
}
