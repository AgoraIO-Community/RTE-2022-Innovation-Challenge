<template>
    <h-help note="查看类型说明">
        <h-modal-page title="观看类型说明">
            <h-list>
                <h-el class="pdv mgb"
                    >[公开]: 所有人都可以观看，可以被搜索、进入排行或者推荐列表
                </h-el>
                <h-el class="pdv mgb">[登录]:登录用户才可以观看</h-el>
                <h-el class="pdv mgb">[密码]: 需要输入密码才可以观看 </h-el>
                <h-el class="pdv"
                    >[邀请]:需要通过邀请连接才可以观看，无法进入排行或者推荐列表，可以被通过特殊id搜索</h-el
                >
            </h-list>
        </h-modal-page>
    </h-help>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
