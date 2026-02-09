/**
 * Newsletter HTML Template Generator
 * Generates HTML email template matching NC State newsletter format
 */

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  function truncateContent(content, maxLength = 200) {
    if (!content || content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  }
  
  /**
   * Generate newsletter HTML from news items
   * @param {Array} newsItems - Array of news items with author_name, title, content, etc.
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Base URL for "Read more" links
   * @param {number} options.periodDays - Number of days covered
   * @returns {string} Complete HTML email string
   */
  export function generateNewsletterHTML(newsItems, options = {}) {
    const { baseUrl = 'http://localhost:5173', periodDays = 14 } = options;
    
    // Get current date for display
    const currentDate = new Date();
    
    const newsItemsHTML = newsItems.map((item, index) => {
      const author = item.author_name || 'Unknown';
      const date = item.created_at ? formatDate(item.created_at) : '';
      const title = item.title || 'Untitled';
      const content = truncateContent(item.content || '', 200);
      const newsUrl = `${baseUrl}/dashboard/all-news#news-${item.id}`;
      
      const thumbnail = Array.isArray(item.image_urls) && item.image_urls.length > 0 
        ? item.image_urls[0] 
        : null;
      
      const hashtags = Array.isArray(item.hashtags) && item.hashtags.length > 0
        ? item.hashtags.map(tag => `#${tag}`).join(' ')
        : '';
      
      return `
        <!-- News Item ${index + 1} -->
        ${index > 0 ? `
        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
          <tr>
            <td align="center" style="padding: 10px 0;">
              <table width="95%" cellpadding="0" cellspacing="0" border="0" style="height: 1px; background-color: #CCCCCC;">
                <tr>
                  <td height="1" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ` : ''}
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 0;">
          ${thumbnail ? `
          <!-- Thumbnail Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${thumbnail}" alt="${title}" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td style="padding: 18px 20px;">
              <!-- Title -->
              <h3 style="margin: 0 0 12px 0; padding: 0; font-family: Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: bold; color: #CC0000; line-height: 1.3;">
                ${title}
              </h3>
              
              <!-- Author & Date -->
              <p style="margin: 0 0 12px 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 14px; color: #202020; line-height: 1.5;">
                <strong style="color: #202020;">${author}</strong> • ${date}
              </p>
              
              <!-- Content Text -->
              <p style="margin: 0 0 12px 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 14px; color: #202020; line-height: 1.6;">
                ${content}
              </p>
              
              ${hashtags ? `
              <!-- Hashtags -->
              <p style="margin: 0 0 12px 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 12px; color: #CC0000; line-height: 1.5;">
                ${hashtags}
              </p>
              ` : ''}
              
              <!-- Read More Link -->
              <p style="margin: 0; padding: 0;">
                <a href="${newsUrl}" style="color: #DE4E3A; font-weight: normal; text-decoration: underline; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 14px;">
                  Read More →
                </a>
              </p>
            </td>
          </tr>
        </table>
      `;
    }).join('');
  
    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>MSE News Portal - Newsletter</title>
    <!--[if gte mso 9]>
    <style type="text/css">
      li { text-indent: -1em; padding: 0; margin: 0; }
      ul, ol { padding: 0 0 0 40px; }
      p { margin: 0; padding: 0; margin-bottom: 0; }
    </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <!-- Preheader -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
      Materials Science & Engineering news and updates
    </div>
    
    <!-- Wrapper Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA; padding: 0;">
      <tr>
        <td align="center" style="padding: 10px;">
          <!-- Main Container (max-width 600px for email clients) -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5;">
            
            <!-- Dark Gray Bar -->
            <tr>
              <td style="background-color: #404040; padding: 0; height: 8px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td height="8" style="line-height: 8px; font-size: 8px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Logo on Left -->
            <tr>
              <td style="padding: 9px 20px 0 20px; background-color: #FFFFFF;">
                <img src="${baseUrl}/logo.svg" alt="NC State University" style="height: 50px; width: auto; display: block; border: 0;" />
              </td>
            </tr>
            
            <!-- Title Block (Centered) -->
            <tr>
              <td style="padding: 10px 20px; background-color: #FFFFFF;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="font-family: Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 26px; font-weight: bold; color: #000000; line-height: 125%;">
                      MSE News Portal
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 5px; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: #000000;">
                      Biweekly Newsletter
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 5px; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 14px; color: #000000;">
                      ${currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Section Header: News Items -->
            <tr>
              <td style="background-color: #CC0000; padding: 18px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="font-family: Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: normal; color: #F2F2F2; line-height: 150%;">
                      Department News
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Newsletter Intro -->
            <tr>
              <td style="padding: 18px 20px; background-color: #FFFFFF;">
                <p style="margin: 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 16px; color: #202020; line-height: 1.6;">
                  Here's what's been happening in the Materials Science & Engineering department over the past ${periodDays} days:
                </p>
              </td>
            </tr>
            
            <!-- News Items -->
            <tr>
              <td style="padding: 0 0 9px 0; background-color: #FFFFFF;">
                ${newsItems.length > 0 ? newsItemsHTML : `
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding: 40px 20px; text-align: center;">
                        <p style="margin: 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 14px; color: #666666;">
                          No news items found for this period.
                        </p>
                      </td>
                    </tr>
                  </table>
                `}
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #CC0000; padding: 30px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <!-- Department Info -->
                  <tr>
                    <td align="center" style="padding-bottom: 10px;">
                      <p style="margin: 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 14px; color: #FFFFFF; line-height: 1.5;">
                        <strong>NC State University</strong><br>
                        Materials Science & Engineering
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                      <p style="margin: 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 12px; color: #CCCCCC; line-height: 1.5;">
                        Raleigh, NC 27695<br>
                        919.515.2011
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Links -->
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                      <p style="margin: 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 12px; color: #FFFFFF; line-height: 1.5;">
                        <a href="${baseUrl}/dashboard/all-news" target="_blank" style="color: #FFFFFF; font-weight: bold; text-decoration: underline;">View All News</a>
                        <span style="color: #FFFFFF;"> | </span>
                        <a href="${baseUrl}/dashboard/profile" target="_blank" style="color: #FFFFFF; font-weight: bold; text-decoration: underline;">Manage Preferences</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Unsubscribe Notice -->
                  <tr>
                    <td align="center">
                      <p style="margin: 0; padding: 0; font-family: Arial, Verdana, Helvetica, sans-serif; font-size: 11px; color: #999999; line-height: 1.5;">
                        You're receiving this because you're a member of the MSE News Portal.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `;
  
    return html.trim();
  }