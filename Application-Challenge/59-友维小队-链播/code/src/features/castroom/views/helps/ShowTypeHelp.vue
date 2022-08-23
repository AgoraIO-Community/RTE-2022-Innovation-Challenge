<template>
    <h-help note="直播类型说明">
        <h-modal-page title="直播类型说明">
            <h-list>
                <h-el class="mgv">[个秀]: 普通的直播，退出后关闭</h-el>
                <h-el class="mgv"
                    >[导播]:类似新闻，可以嵌入一个他人的直播视频
                </h-el>
                <h-el class="mgv"
                    >[直映]:需要组织人员加入，导演来控制最终的布局和内容，和发布</h-el
                >
                <h-el class="mgv"
                    >[焦点]:可以将多个视频源进行组合，提供多个焦点的直播，导播主要控制每个焦点的视频源头，单个焦点只支持播放一个视频源</h-el
                >
            </h-list>
        </h-modal-page>
    </h-help>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
