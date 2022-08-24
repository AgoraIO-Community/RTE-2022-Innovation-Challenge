//
//  HomeViewController.m
//  Goods FLow
//
//  Created by hudachui on 2022/7/22.
//

#import "HomeViewController.h"
#import "ViewController.h"
#import "DCHomeMessageTableViewCell.h"
#import "MessageDBManager.h"
#import "DCMessageModel.h"
#import <MJRefresh.h>
#import "DCDetailViewController.h"
#import "SDCycleScrollView.h"
#import "DCDataFromJson.h"
#import "BBAddShadowTool.h"
@interface HomeViewController ()<UITableViewDelegate,UITableViewDataSource>
@property(strong,nonatomic)NSArray * dataArr;
@property(strong,nonatomic)NSArray * jsonArr;

@property(weak,nonatomic)UITableView * tableView;

@end

@implementation HomeViewController


- (void)viewWillAppear:(BOOL)animated{
    [super viewWillAppear:animated];
    self.navigationController.navigationBarHidden = YES;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self initSubViews];

    self.dataArr = [[MessageDBManager sharedInstance] loadMessages];
    self.jsonArr = [DCDataFromJson getdatafromJson];
    [self.tableView reloadData];
    __weak typeof(self) weakSelf = self;
    self.tableView.mj_header = [MJRefreshNormalHeader headerWithRefreshingBlock:^{
        weakSelf.dataArr = [[MessageDBManager sharedInstance] loadMessages];
        [weakSelf.tableView reloadData];
        [weakSelf.tableView.mj_header endRefreshing];
    }];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(jumpToHomeVC) name:@"jumpToHomeVC" object:nil];
}

- (void)jumpToHomeVC{
    [self.tableView.mj_header beginRefreshing];
}

- (void)initSubViews{
    
    UIView * topShadowView = [[UIView alloc] initWithFrame:(CGRectMake(0, 0, KScreenWidth, 154 * KScreenRatio))];
    topShadowView.backgroundColor = UIColor.whiteColor;
    [self.view addSubview:topShadowView];
    [BBAddShadowTool addShadowToViewOnlyBottom:topShadowView];
    
    UILabel * titlelabel = [[UILabel alloc] init];
    titlelabel.width = 200;
    titlelabel.centerX = self.view.centerX;
    titlelabel.y = 84 * KScreenRatio;
    titlelabel.height = 24;
    titlelabel.text = @"交易物品";
    titlelabel.textAlignment = NSTextAlignmentCenter;
    titlelabel.font = [UIFont systemFontOfSize:19];
    [topShadowView addSubview:titlelabel];
    self.view.backgroundColor = UIColor.whiteColor;
    UITableView * tableView = [[UITableView alloc] initWithFrame:CGRectMake(0, 154 * KScreenRatio, KScreenWidth, KScreenHeight - (154 * KScreenRatio) - 49 - EMVIEWTOPMARGIN) style:(UITableViewStylePlain)];
    

    tableView.delegate = self;
    tableView.dataSource = self;
    tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    tableView.showsVerticalScrollIndicator = NO;
    [tableView registerClass:[DCHomeMessageTableViewCell class] forCellReuseIdentifier:@"homeCell"];
    [self.view addSubview:tableView];
    self.tableView = tableView;
    
}


- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    if (section == 0) {
        return self.dataArr.count;
    }else{
        return self.jsonArr.count;
    }
    
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    DCHomeMessageTableViewCell * cell = [tableView dequeueReusableCellWithIdentifier:@"homeCell"];
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    if (indexPath.section == 0) {
        DCMessageModel * model = self.dataArr[indexPath.row];
        cell.model = model;
    }else{
        DCMessageModel * model = self.jsonArr[indexPath.row];
        cell.model = model;
    }
    
    return cell;
}



- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    
    DCDetailViewController * detailVC = [[DCDetailViewController alloc] init];
    if (indexPath.section == 0) {
        detailVC.model = self.dataArr[indexPath.row];
        NSArray * picArr = [detailVC.model.imgName componentsSeparatedByString:@","];
        detailVC.numOfPic = picArr.count;
    }else{
        detailVC.model = self.jsonArr[indexPath.row];
        NSArray * picArr = [detailVC.model.imgName componentsSeparatedByString:@","];
        detailVC.numOfPic = picArr.count;
    }
    
    [self.navigationController pushViewController:detailVC animated:YES];
}


- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return 100;
}


- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    return 2;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section{
    if (section == 0) {
        
        UIView * view = [[UIView alloc] initWithFrame:(CGRectMake(0, 0, KScreenWidth, 150))];
        view.backgroundColor = UIColor.whiteColor;
        
        UIView * shadowView = [[UIView alloc] initWithFrame:(CGRectMake(12, 12, KScreenWidth - 24, 126))];
        shadowView.backgroundColor = UIColor.whiteColor;
        [view addSubview:shadowView];
        // 阴影颜色
        shadowView.layer.shadowColor = UIColor.blackColor.CGColor;
        // 阴影偏移，默认(0, -3)
        shadowView.layer.shadowOffset = CGSizeMake(0,3);
        // 阴影透明度，默认0
        shadowView.layer.shadowOpacity = 0.5;
        // 阴影半径，默认3
        shadowView.layer.shadowRadius = 3;
        
        // 本地加载图片的轮播器
        SDCycleScrollView *cycleScrollView = [SDCycleScrollView cycleScrollViewWithFrame:CGRectMake(5, 5, KScreenWidth - 34 , 116) imageNamesGroup:@[[UIImage imageNamed:@"backhome1.jpg"],[UIImage imageNamed:@"backhome1.jpg"]]];
        [shadowView addSubview:cycleScrollView];
        return  view;
    }else{
        UIView * view = [[UIView alloc] initWithFrame:(CGRectMake(0, 0, KScreenWidth, 0.1))];
        return view;
    }
    
   
}

- (CGFloat)tableView:(UITableView *)tableView estimatedHeightForHeaderInSection:(NSInteger)section{
    if (section == 0) {
        return 150;
    }
    return 0.01;
}

//重载scrollview取消header悬停
- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    CGFloat sectionHeaderHeight = 155;
    if (scrollView.contentOffset.y<=sectionHeaderHeight&&scrollView.contentOffset.y>=0) {
        scrollView.contentInset = UIEdgeInsetsMake(-scrollView.contentOffset.y, 0, 0, 0);
    } else if (scrollView.contentOffset.y>=sectionHeaderHeight) {
        scrollView.contentInset = UIEdgeInsetsMake(-sectionHeaderHeight, 0, 0, 0);
    }
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
