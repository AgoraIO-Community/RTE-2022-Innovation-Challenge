//
//  DCHomeMessageTableViewCell.m
//  Goods FLow
//
//  Created by hudachui on 2022/7/24.
//

#import "DCHomeMessageTableViewCell.h"
#import "MessageDBManager.h"
@interface DCHomeMessageTableViewCell ()
@property(weak, nonatomic)UIImageView * img;
@property(weak, nonatomic)UILabel * titleLB;
@property(weak, nonatomic)UILabel * locationLB;
@property(weak, nonatomic)UILabel * timeLB;

@end

@implementation DCHomeMessageTableViewCell

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
}
- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier{
    if (self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]) {
        [self buildSubViews];
    }
    
    return self;
}

- (void)buildSubViews{
    UIImageView * img = [[UIImageView alloc] initWithFrame:(CGRectMake(10, 10, 80, 80))];
    [self.contentView addSubview:img];
    img.contentMode = UIViewContentModeScaleAspectFit;
    self.img = img;
    
    UILabel * titleLB = [[UILabel alloc] initWithFrame:(CGRectMake(100, 20, self.width - 100, 20))];
    titleLB.textColor = UIColor.blackColor;
    titleLB.font = [UIFont systemFontOfSize:19];
    self.titleLB = titleLB;
    [self.contentView addSubview:titleLB];
    
    
    UILabel * locationLB = [[UILabel alloc] initWithFrame:(CGRectMake(100, 60, self.width - 100, 20))];
    locationLB.textColor = KFontColor;
    locationLB.font = [UIFont systemFontOfSize:16];
    self.locationLB = locationLB;
    [self.contentView addSubview:locationLB];
    
    UILabel * timeLB = [[UILabel alloc] initWithFrame:(CGRectMake(KScreenWidth - 100, 40,  90, 20))];
    timeLB.textColor = KFontColor;
    timeLB.font = [UIFont systemFontOfSize:14];
    self.timeLB = timeLB;
    [self.contentView addSubview:timeLB];
    
}

- (void)setModel:(DCMessageModel *)model{
    if (_model != model) {
        self.titleLB.text = model.title;
        self.timeLB.text = [self timestampSwitchTime:model.timestamp andFormatter:@"YYYY-MM-dd"];
        self.locationLB.text = model.address;
        NSArray * picArr = [model.imgName componentsSeparatedByString:@","];
        self.img.image = [[MessageDBManager sharedInstance] getCacheImageUseImagePath:picArr[0]];
        if ([[MessageDBManager sharedInstance] getCacheImageUseImagePath:picArr[0]] == nil) {
            self.img.image = [UIImage imageNamed:model.imgName];
        }
        
    }
}

- (NSString *)timestampSwitchTime:(NSInteger)timestamp andFormatter:(NSString *)format{
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    [formatter setDateStyle:NSDateFormatterMediumStyle];
    [formatter setTimeStyle:NSDateFormatterShortStyle];
    [formatter setDateFormat:format];
    NSTimeZone *timeZone = [NSTimeZone timeZoneWithName:@"Asia/Beijing"];
    [formatter setTimeZone:timeZone];
    
    NSDate *confromTimesp = [NSDate dateWithTimeIntervalSince1970:timestamp];
    
    NSString *confromTimespStr = [formatter stringFromDate:confromTimesp];
    if ([format isEqual:@"HH:mm:ss"] && confromTimespStr.length<8) {
        confromTimespStr = @"00:00:00";
    }
    if ([format isEqual:@"YYYY-MM-dd HH:mm:ss"] && confromTimespStr.length<18) {
        confromTimespStr = @"2000-01-01 00:00:00"; //默认返回
    }
    return confromTimespStr;
}




- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];

    // Configure the view for the selected state
}

@end
