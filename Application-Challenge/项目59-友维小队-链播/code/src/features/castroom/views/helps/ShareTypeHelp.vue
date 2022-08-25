<template>
    <h-help note="查看类型说明">
        <h-modal-page title="分享类型说明">
            <h-list>
                <h-el class="pdv mgb"
                    >[免费]: 他人可以免费使用本人的视频流</h-el
                >
                <h-el class="pdv mgb"
                    >[分成]:
                    使用本视频流的用户获取收益时，本人可以获得分成，关联度不超过三级，分成比例逐层递减；（例如D使用到C使用了B使用了A的视频，D与A的关联度为3，E再使用D的视频时，A无法享受分成）
                </h-el>
                <h-el class="pdv"
                    >[订阅]: 仅有订阅者能够使用本人的视频流，但不再分享收益
                </h-el>
            </h-list>
        </h-modal-page>
    </h-help>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
