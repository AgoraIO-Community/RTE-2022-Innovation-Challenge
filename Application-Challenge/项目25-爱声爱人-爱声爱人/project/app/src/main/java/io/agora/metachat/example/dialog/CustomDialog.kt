package io.agora.metachat.example.dialog

import android.content.Context
import android.graphics.Rect
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import coil.load
import coil.transform.CircleCropTransformation
import com.afollestad.materialdialogs.MaterialDialog
import com.afollestad.materialdialogs.bottomsheets.GridItem
import com.afollestad.materialdialogs.bottomsheets.gridItems
import com.afollestad.materialdialogs.customview.customView
import com.afollestad.materialdialogs.customview.getCustomView
import io.agora.metachat.example.R
import io.agora.metachat.example.adapter.TipsAdapter
import io.agora.metachat.example.adapter.UserAdapter
import io.agora.metachat.example.databinding.ProgressBarBinding
import io.agora.metachat.example.databinding.TipsDialogBinding

class CustomDialog {

    companion object {

        data class AvatarGridItem(
            val url: String,
        ) : GridItem {
            override val title: String
                get() = ""

            override fun configureTitle(textView: TextView) {
                textView.visibility = View.GONE
            }

            override fun populateIcon(imageView: ImageView) {
                imageView.load(url) {
                    crossfade(true)
                    transformations(CircleCropTransformation())
                }
            }
        }

        @JvmStatic
        fun showAvatarPicker(
            context: Context,
            selection: ((CharSequence) -> Unit)?,
            positive: ((MaterialDialog) -> Unit)?,
            negative: ((MaterialDialog) -> Unit)?,
        ): MaterialDialog {
            val items = listOf(
                AvatarGridItem("https://accpic.sd-rtn.com/pic/test/png/2.png"),
                AvatarGridItem("https://accpic.sd-rtn.com/pic/test/png/4.png"),
                AvatarGridItem("https://accpic.sd-rtn.com/pic/test/png/1.png"),
                AvatarGridItem("https://accpic.sd-rtn.com/pic/test/png/3.png"),
                AvatarGridItem("https://accpic.sd-rtn.com/pic/test/png/6.png"),
                AvatarGridItem("https://accpic.sd-rtn.com/pic/test/png/5.png"),
            )
            return MaterialDialog(context).gridItems(
                items,
                customGridWidth = R.integer.md_grid_width
            ) { _, _, item ->
                selection?.invoke(item.url)
            }.show {
                title(text = "选择头像")
                positiveButton(text = "确定", click = positive)
                negativeButton(text = "取消", click = negative)
            }
        }

        @JvmStatic
        fun showDownloadingChooser(
            context: Context,
            positive: ((MaterialDialog) -> Unit)?,
            negative: ((MaterialDialog) -> Unit)?,
        ): MaterialDialog {
            return MaterialDialog(context).show {
                title(text = "下载提示")
                message(text = "首次进入MetaChat场景需下载350M数据包")
                positiveButton(text = "立即下载", click = positive)
                negativeButton(text = "下次再说", click = negative)
            }
        }

        @JvmStatic
        fun showDownloadingProgress(
            context: Context, negative: ((MaterialDialog) -> Unit)?,
        ): MaterialDialog {
            return MaterialDialog(context).show {
                title(text = "下载中")
                message(text = "首次进入MetaChat场景需下载350M数据包")
                customView(
                    view = ProgressBarBinding.inflate(LayoutInflater.from(context)).root,
                    horizontalPadding = true,
                )
                cancelOnTouchOutside(false)
                negativeButton(text = "取消", click = negative)
            }
        }

        @JvmStatic
        fun <T> getCustomView(dialog: MaterialDialog): T {
            return dialog.getCustomView() as T
        }
        @JvmStatic
        fun showGItem(context: Context,imgpath: String,txt: String,selection: ((CharSequence) -> Unit)?,
                      positive: ((MaterialDialog) -> Unit)?,
                      negative: ((MaterialDialog) -> Unit)?,): MaterialDialog {
            val items = listOf(

                AvatarGridItem(imgpath)
        )
            return MaterialDialog(context).gridItems(
                    items,
                    customGridWidth = R.integer.md_grid_width
            ) { _, _, item ->
                selection?.invoke(item.url)
            }.show {


                val binding = TipsDialogBinding.inflate(LayoutInflater.from(context))
                binding.title.text = "读句挑战！"
                binding.close.setOnClickListener { dismiss() }
                val space = TypedValue.applyDimension(
                        TypedValue.COMPLEX_UNIT_DIP, 11f,
                        context.resources.displayMetrics
                ).toInt()
                binding.list.addItemDecoration(object : RecyclerView.ItemDecoration() {
                    override fun getItemOffsets(
                            outRect: Rect,
                            view: View,
                            parent: RecyclerView,
                            state: RecyclerView.State
                    ) {
                        outRect.top = space

                        val position = parent.getChildAdapterPosition(view)
                        // Add top margin only for the first item to avoid double space between items
                        if (position == 0)
                            outRect.top = 0
                    }
                })
                binding.list.adapter = TipsAdapter(
                        arrayOf(
                                txt
                        )
                )
                customView(
                        view = binding.root,
                        horizontalPadding = true,
                )
            }
        }
        @JvmStatic
        fun showUsage(context: Context): MaterialDialog {
            return MaterialDialog(context).show {
                val binding = TipsDialogBinding.inflate(LayoutInflater.from(context))
                binding.title.text = "欢迎光临"
                binding.close.setOnClickListener { dismiss() }
                val space = TypedValue.applyDimension(
                        TypedValue.COMPLEX_UNIT_DIP, 11f,
                        context.resources.displayMetrics
                ).toInt()
                binding.list.addItemDecoration(object : RecyclerView.ItemDecoration() {
                    override fun getItemOffsets(
                            outRect: Rect,
                            view: View,
                            parent: RecyclerView,
                            state: RecyclerView.State
                    ) {
                        outRect.top = space

                        val position = parent.getChildAdapterPosition(view)
                        // Add top margin only for the first item to avoid double space between items
                        if (position == 0)
                            outRect.top = 0
                    }
                })
                binding.list.adapter = TipsAdapter(
                        arrayOf(
                                "在您漫步在元语聊的世界时，随机会弹出挑战，您可以尝试读出弹出的语句，展示您富有磁性的嗓音！’",
                        )
                )
                customView(
                        view = binding.root,
                        horizontalPadding = true,
                )
            }
        }

        @JvmStatic
        fun showTips(context: Context): MaterialDialog {
            return MaterialDialog(context).show {
                val binding = TipsDialogBinding.inflate(LayoutInflater.from(context))
                binding.title.text = "游客模式"
                binding.close.setOnClickListener { dismiss() }
                val space = TypedValue.applyDimension(
                    TypedValue.COMPLEX_UNIT_DIP, 11f,
                    context.resources.displayMetrics
                ).toInt()
                binding.list.addItemDecoration(object : RecyclerView.ItemDecoration() {
                    override fun getItemOffsets(
                        outRect: Rect,
                        view: View,
                        parent: RecyclerView,
                        state: RecyclerView.State
                    ) {
                        outRect.top = space

                        val position = parent.getChildAdapterPosition(view)
                        // Add top margin only for the first item to avoid double space between items
                        if (position == 0)
                            outRect.top = 0
                    }
                })
                binding.list.adapter = TipsAdapter(
                    arrayOf(
                        "游客可以看到场景内参与语聊的用户但是无法与这些用户互动",
                        "游客上“隐形”的，其他所有用户都看不到您",
                        "上麦即可参与语聊和互动，其他用户便会看到您了",
                    )
                )
                customView(
                    view = binding.root,
                    horizontalPadding = true,
                )
            }
        }

        @JvmStatic
        fun showUsers(
            context: Context,
            adapter: UserAdapter,
        ): MaterialDialog {
            return MaterialDialog(context).show {
                val binding = TipsDialogBinding.inflate(LayoutInflater.from(context))
                binding.title.text = "在线用户"
                binding.close.setOnClickListener { dismiss() }
                val space = TypedValue.applyDimension(
                    TypedValue.COMPLEX_UNIT_DIP, 6f,
                    context.resources.displayMetrics
                ).toInt()
                binding.list.addItemDecoration(object : RecyclerView.ItemDecoration() {
                    override fun getItemOffsets(
                        outRect: Rect,
                        view: View,
                        parent: RecyclerView,
                        state: RecyclerView.State
                    ) {
                        outRect.top = space

                        val position = parent.getChildAdapterPosition(view)
                        // Add top margin only for the first item to avoid double space between items
                        if (position == 0)
                            outRect.top = 0
                    }
                })
                binding.list.adapter = adapter
                customView(
                    view = binding.root,
                    horizontalPadding = true,
                )
            }
        }

    }

}
